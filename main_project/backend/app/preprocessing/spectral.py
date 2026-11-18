"""
Spectral profiling module for universal EEG normalization and 19-channel spatial analysis.
Computes Individual Alpha Frequency (IAF), channel-level Welch Power Spectral Density (PSD),
Theta/Beta Ratio (TBR), 5-region anatomical aggregation, and data-driven spatial telemetry.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import numpy as np
from scipy import signal

from app.config import MODEL_CHANNEL_NAMES, REQUIRED_CHANNELS, TARGET_FS
from app.utils.logging import log_pipeline_step

STANDARD_19_CHANNELS: List[str] = list(MODEL_CHANNEL_NAMES)

# Anatomical 10-20 Region Mapping (Exact 19 Channels)
REGIONAL_CHANNEL_MAP: Dict[str, List[str]] = {
    "Frontal": ["Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8"],
    "Central": ["C3", "Cz", "C4"],
    "Temporal": ["T3", "T4", "T5", "T6"],
    "Parietal": ["P3", "Pz", "P4"],
    "Occipital": ["O1", "O2"],
}

# Standard Clinical EEG Frequency Bands (in Hz)
FREQUENCY_BANDS: Dict[str, Tuple[float, float]] = {
    "delta": (0.5, 4.0),
    "theta": (4.0, 8.0),
    "alpha": (8.0, 13.0),
    "beta":  (13.0, 30.0),
    "gamma": (30.0, 45.0),
}


def canonicalize_channel_name(ch: str) -> str:
    """Normalize arbitrary channel labels (e.g. 'eeg fp1', 'FP2', 'Fz-ref') to standard 10-20 name."""
    clean = ch.strip().upper()
    for prefix in ["EEG", "REF", "CH", "CHAN"]:
        if clean.startswith(prefix):
            clean = clean[len(prefix):].strip(" -_")
        if clean.endswith(prefix):
            clean = clean[:-len(prefix)].strip(" -_")
    clean = clean.replace("-REF", "").replace("_REF", "").strip()
    for std_ch in STANDARD_19_CHANNELS:
        if clean == std_ch.upper() or clean.startswith(std_ch.upper()):
            return std_ch
    return ch


def _integrate_psd(psd_band: np.ndarray, freqs_band: np.ndarray) -> np.ndarray:
    """
    Integrate PSD across frequency bins.
    Cross-compatible with both numpy 2.x (trapezoid) and numpy 1.x (trapz).
    """
    if len(freqs_band) < 2:
        return np.zeros(psd_band.shape[1], dtype=np.float64) if psd_band.ndim == 2 else 0.0

    if hasattr(np, "trapezoid"):
        return np.trapezoid(psd_band, freqs_band, axis=0)
    return np.trapz(psd_band, freqs_band, axis=0)


def compute_spectral_profile(
    data: np.ndarray,
    fs: float = TARGET_FS
) -> Dict[str, float]:
    """
    Compute aggregate spectral profile (IAF and global TBR) for age and task offset compensation.
    """
    if len(data) < 256 or data.ndim != 2:
        return {
            "iaf_hz": 10.0,
            "tbr": 2.0,
            "profile": "adult",
            "spectral_offset": 0.0,
        }

    nperseg = min(256, len(data))
    freqs, psd = signal.welch(data, fs=fs, nperseg=nperseg, noverlap=nperseg // 2, axis=0)

    # 1. Individual Alpha Frequency (7-13 Hz)
    alpha_mask = (freqs >= 7.0) & (freqs <= 13.0)
    if np.any(alpha_mask):
        mean_psd_alpha = np.mean(psd[alpha_mask, :], axis=1)
        peak_idx = np.argmax(mean_psd_alpha)
        iaf = float(freqs[alpha_mask][peak_idx])
    else:
        iaf = 10.0

    # 2. Frontal/global Theta (4-8 Hz) and Beta (13-30 Hz) power
    theta_mask = (freqs >= 4.0) & (freqs < 8.0)
    beta_mask = (freqs >= 13.0) & (freqs <= 30.0)

    theta_power = float(np.mean(psd[theta_mask, :])) if np.any(theta_mask) else 1e-6
    beta_power = float(np.mean(psd[beta_mask, :])) if np.any(beta_mask) else 1e-6
    tbr = float(theta_power / max(beta_power, 1e-8))

    if iaf < 9.5 or tbr > 2.6:
        profile_type = "pediatric"
        spectral_offset = 0.0
    else:
        profile_type = "adult"
        spectral_offset = -0.05 if tbr > 1.8 else 0.0

    log_pipeline_step(
        "SPECTRAL",
        f"Spectral Profile: IAF={iaf:.1f} Hz, TBR={tbr:.2f}, Cohort Profile={profile_type}"
    )

    return {
        "iaf_hz": round(iaf, 2),
        "tbr": round(tbr, 4),
        "profile": profile_type,
        "spectral_offset": spectral_offset,
    }


def compute_19_channel_spectral_analysis(
    data: np.ndarray,
    fs: float = TARGET_FS,
    channel_names: Optional[List[str]] = None,
    available_channel_set: Optional[Set[str]] = None
) -> Dict[str, Any]:
    """
    Rigorous 19-Channel EEG Topographic Spectral and Spatial Activity Analysis:
    1. Channel-level Welch PSD (0.5–45 Hz) across the 19 standard 10-20 leads.
    2. Exact spectral power integration for Delta, Theta, Alpha, Beta, and Gamma.
    3. Channel-by-channel Theta/Beta Ratio (TBR = Theta / Beta).
    4. Both absolute power (μV²) and relative power (%) distribution.
    5. 5-region anatomical aggregation (Frontal, Central, Temporal, Parietal, Occipital).
    6. Regional TBR derived from regional Theta and Beta power (not average of ratios).
    7. Most prominent and attenuated electrode identification per metric.
    8. Dynamic metric ranges (min, max, mean) for exact, unclipped colormap visualization.
    9. Data-supported neuro-spectral observations.

    Parameters:
        data: Continuous EEG voltage array of shape (samples, 19).
        fs: Sampling rate in Hz (default 128.0 Hz).
        channel_names: List of 19 channel names in model order.
        available_channel_set: Set of channel names natively present in recording.

    Returns:
        Structured spatial analysis dictionary.
    """
    if channel_names is None:
        channel_names = MODEL_CHANNEL_NAMES.copy()

    time_samples, num_channels = data.shape
    if num_channels != REQUIRED_CHANNELS:
        raise ValueError(
            f"Expected {REQUIRED_CHANNELS} channels for spatial topography analysis; got {num_channels}."
        )

    # Ensure physical signal scale in microvolts (μV)
    # If maximum amplitude is < 0.05 (e.g. raw Volts, 1e-5 V), scale to μV
    max_amp = float(np.max(np.abs(data))) if time_samples > 0 else 1.0
    scale_factor = 1e6 if (0.0 < max_amp < 0.05) else 1.0
    data_scaled = data * scale_factor

    # Effective window size for Welch PSD (2.0s = 0.5 Hz frequency bin resolution)
    nperseg = min(int(2.0 * fs), time_samples)
    if nperseg < 32:
        nperseg = time_samples

    noverlap = nperseg // 2
    freqs, psd = signal.welch(data_scaled, fs=fs, nperseg=nperseg, noverlap=noverlap, axis=0)

    # Map each channel to its region
    ch_to_region: Dict[str, str] = {}
    for region, ch_list in REGIONAL_CHANNEL_MAP.items():
        for ch in ch_list:
            ch_to_region[ch.upper()] = region

    # 1. Compute per-band powers for all 19 channels
    band_powers: Dict[str, np.ndarray] = {}
    for band_name, (f_low, f_high) in FREQUENCY_BANDS.items():
        # Only evaluate frequencies up to Nyquist
        if f_high > fs / 2:
            f_high = fs / 2

        mask = (freqs >= f_low) & (freqs < f_high)
        if np.any(mask):
            p = _integrate_psd(psd[mask, :], freqs[mask])
            band_powers[band_name] = np.maximum(p, 0.0)
        else:
            band_powers[band_name] = np.zeros(num_channels, dtype=np.float64)

    # Total broadband power across 0.5 - 45 Hz
    total_power = (
        band_powers["delta"] +
        band_powers["theta"] +
        band_powers["alpha"] +
        band_powers["beta"] +
        band_powers["gamma"]
    )
    total_power = np.maximum(total_power, 1e-8)

    # Per-channel TBR (Theta / Beta) with safe division
    beta_safe = np.maximum(band_powers["beta"], 1e-8)
    channel_tbr = np.clip(band_powers["theta"] / beta_safe, 0.01, 50.0)

    # Determine availability flags
    if available_channel_set:
        avail_upper = {ch.upper() for ch in available_channel_set}
    else:
        avail_upper = {ch.upper() for ch in channel_names}

    # 2. Build detailed channel electrode dictionary
    electrodes_dict: Dict[str, Dict[str, Any]] = {}
    canonical_channel_names = [canonicalize_channel_name(ch) for ch in channel_names]

    for i, ch_name in enumerate(canonical_channel_names):
        orig_name = channel_names[i]
        is_avail = ch_name.upper() in avail_upper or orig_name.upper() in avail_upper
        region = ch_to_region.get(ch_name.upper(), "Frontal")

        d_pow = float(band_powers["delta"][i])
        t_pow = float(band_powers["theta"][i])
        a_pow = float(band_powers["alpha"][i])
        b_pow = float(band_powers["beta"][i])
        g_pow = float(band_powers["gamma"][i])
        tot_pow = float(total_power[i])
        tbr_val = float(channel_tbr[i])

        electrodes_dict[ch_name] = {
            "id": ch_name,
            "name": f"{ch_name} ({region})",
            "lobe": region,
            "delta_power": round(d_pow, 2),
            "theta_power": round(t_pow, 2),
            "alpha_power": round(a_pow, 2),
            "beta_power": round(b_pow, 2),
            "gamma_power": round(g_pow, 2),
            "total_power": round(tot_pow, 2),
            "tbr": round(tbr_val, 2),
            "relative_powers": {
                "delta": round(float((d_pow / tot_pow) * 100), 1),
                "theta": round(float((t_pow / tot_pow) * 100), 1),
                "alpha": round(float((a_pow / tot_pow) * 100), 1),
                "beta":  round(float((b_pow / tot_pow) * 100), 1),
                "gamma": round(float((g_pow / tot_pow) * 100), 1),
            },
            "is_available": is_avail,
        }

    # 3. Compute 5-Region Anatomical Aggregation
    regions_dict: Dict[str, Dict[str, Any]] = {}
    ch_indices = {ch: idx for idx, ch in enumerate(canonical_channel_names)}

    for region, ch_list in REGIONAL_CHANNEL_MAP.items():
        indices = [ch_indices[ch] for ch in ch_list if ch in ch_indices]
        if not indices:
            continue

        reg_delta = float(np.mean(band_powers["delta"][indices]))
        reg_theta = float(np.mean(band_powers["theta"][indices]))
        reg_alpha = float(np.mean(band_powers["alpha"][indices]))
        reg_beta = float(np.mean(band_powers["beta"][indices]))
        reg_gamma = float(np.mean(band_powers["gamma"][indices]))
        reg_total = reg_delta + reg_theta + reg_alpha + reg_beta + reg_gamma
        reg_total = max(reg_total, 1e-8)

        # Regional TBR calculated from regional Theta and Beta power values
        reg_tbr = float(reg_theta / max(reg_beta, 1e-8))

        regions_dict[region] = {
            "region": region,
            "channels": ch_list,
            "channel_count": len(ch_list),
            "delta_power": round(reg_delta, 2),
            "theta_power": round(reg_theta, 2),
            "alpha_power": round(reg_alpha, 2),
            "beta_power": round(reg_beta, 2),
            "gamma_power": round(reg_gamma, 2),
            "total_power": round(reg_total, 2),
            "tbr": round(reg_tbr, 2),
            "relative_powers": {
                "delta": round((reg_delta / reg_total) * 100, 1),
                "theta": round((reg_theta / reg_total) * 100, 1),
                "alpha": round((reg_alpha / reg_total) * 100, 1),
                "beta":  round((reg_beta / reg_total) * 100, 1),
                "gamma": round((reg_gamma / reg_total) * 100, 1),
            },
        }

    # 4. Extract Most Prominent & Attenuated Channels per Metric
    prominent_dict: Dict[str, List[Dict[str, Any]]] = {}
    metrics_to_rank = ["tbr", "theta", "beta", "alpha", "delta", "gamma"]

    for m in metrics_to_rank:
        if m == "tbr":
            vals = [(ch, electrodes_dict[ch]["tbr"], electrodes_dict[ch]["lobe"]) for ch in canonical_channel_names]
        else:
            vals = [(ch, electrodes_dict[ch][f"{m}_power"], electrodes_dict[ch]["lobe"]) for ch in canonical_channel_names]

        # Sort descending for prominence
        sorted_vals = sorted(vals, key=lambda x: x[1], reverse=True)
        top3 = [
            {
                "id": item[0],
                "name": f"{item[0]} ({item[2]})",
                "lobe": item[2],
                "value": round(float(item[1]), 2),
                "rank": rank + 1,
            }
            for rank, item in enumerate(sorted_vals[:3])
        ]
        prominent_dict[m] = top3

    # 5. Dynamic Metric Ranges across all 19 channels for frontend colormap normalization
    ranges_dict: Dict[str, Dict[str, Any]] = {}
    for m in metrics_to_rank:
        if m == "tbr":
            arr = channel_tbr
            unit = "Ratio"
        else:
            arr = band_powers[m]
            unit = "μV²"

        ranges_dict[m] = {
            "min": round(float(np.min(arr)), 2),
            "max": round(float(np.max(arr)), 2),
            "mean": round(float(np.mean(arr)), 2),
            "std": round(float(np.std(arr)), 2),
            "unit": unit,
        }

    # 6. Synthesize Data-Supported EEG Pattern Observations
    observations: List[str] = []

    # Frontal vs Posterior Theta Slowing
    frontal_theta = regions_dict.get("Frontal", {}).get("theta_power", 0.0)
    parietal_theta = regions_dict.get("Parietal", {}).get("theta_power", 0.0)
    occipital_theta = regions_dict.get("Occipital", {}).get("theta_power", 0.0)
    posterior_theta = max((parietal_theta + occipital_theta) / 2.0, 1e-6)

    theta_ratio = frontal_theta / posterior_theta
    if theta_ratio >= 1.20:
        observations.append(
            f"Elevated Frontal Theta: Anterior frontal leads show relatively elevated slow wave power ({frontal_theta:.1f} μV²) "
            f"compared to posterior regions ({posterior_theta:.1f} μV²; ratio {theta_ratio:.2f}), reflecting frontocortical slow-wave prominence in this recording."
        )
    else:
        observations.append(
            f"Balanced Anterior-Posterior Theta: Theta power is evenly distributed across frontal ({frontal_theta:.1f} μV²) "
            f"and posterior leads ({posterior_theta:.1f} μV²), with no localized frontal slowing observed."
        )

    # Frontal Beta Power / Arousal
    frontal_beta = regions_dict.get("Frontal", {}).get("beta_power", 0.0)
    central_beta = regions_dict.get("Central", {}).get("beta_power", 0.0)
    if frontal_beta < central_beta * 0.85:
        observations.append(
            f"Frontal Beta Attenuation: Fast beta oscillations (13–30 Hz) are relatively reduced in anterior executive leads ({frontal_beta:.1f} μV²) "
            f"relative to the central sensorimotor strip ({central_beta:.1f} μV²)."
        )
    else:
        observations.append(
            f"Robust Frontocentral Beta: Frontal fast beta activity ({frontal_beta:.1f} μV²) is preserved in equilibrium "
            f"with central sensorimotor rhythms ({central_beta:.1f} μV²)."
        )

    # Regional TBR Comparison
    max_tbr_region = max(regions_dict.keys(), key=lambda r: regions_dict[r]["tbr"])
    max_tbr_val = regions_dict[max_tbr_region]["tbr"]
    min_tbr_region = min(regions_dict.keys(), key=lambda r: regions_dict[r]["tbr"])
    min_tbr_val = regions_dict[min_tbr_region]["tbr"]

    observations.append(
        f"Regional Theta/Beta Disparity: The highest regional TBR is observed over the {max_tbr_region} cortex ({max_tbr_val:.2f}), "
        f"compared to {min_tbr_region} leads ({min_tbr_val:.2f}), indicating regional modulation of spectral arousal."
    )

    # Posterior Alpha Preservation
    occipital_alpha = regions_dict.get("Occipital", {}).get("alpha_power", 0.0)
    frontal_alpha = regions_dict.get("Frontal", {}).get("alpha_power", 0.0)
    if occipital_alpha > frontal_alpha:
        observations.append(
            f"Preserved Posterior Alpha: Expected posterior alpha prominence at O1/O2 ({occipital_alpha:.1f} μV² vs anterior {frontal_alpha:.1f} μV²) "
            f"indicates intact primary visual cortical gating."
        )

    # Overall profile
    spec_summary = compute_spectral_profile(data, fs=fs)

    log_pipeline_step(
        "SPATIAL",
        f"19-Channel Spatial Analysis complete: Max TBR={ranges_dict['tbr']['max']:.2f} ({prominent_dict['tbr'][0]['id']}), "
        f"Regional Frontal TBR={regions_dict.get('Frontal', {}).get('tbr', 0):.2f}"
    )

    return {
        "iaf_hz": spec_summary["iaf_hz"],
        "global_tbr": spec_summary["tbr"],
        "profile": spec_summary["profile"],
        "spectral_offset": spec_summary["spectral_offset"],
        "electrodes": electrodes_dict,
        "regions": regions_dict,
        "prominent_channels": prominent_dict,
        "metric_ranges": ranges_dict,
        "observations": observations,
        "disclaimer": (
            "Observed EEG Patterns — Not a Standalone ADHD Diagnosis. "
            "Quantitative spectral power distribution and Theta/Beta Ratios reflect relative neuro-oscillatory electrophysiology "
            "during this specific recording window. They do not constitute an independent psychiatric diagnosis."
        ),
    }
