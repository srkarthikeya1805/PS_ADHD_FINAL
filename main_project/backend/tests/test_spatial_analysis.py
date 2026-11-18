"""
Tests for 19-Channel Spatial EEG Analysis and Scalp Topography Pipeline.
Verifies:
1. Identification and mapping of all 19 standard 10-20 channels.
2. Welch PSD computation for Delta, Theta, Alpha, Beta, Gamma bands.
3. Channel-level and Regional Theta/Beta Ratio (TBR) calculation.
4. 5-Region anatomical aggregation (Frontal, Central, Temporal, Parietal, Occipital).
5. Dynamic metric ranges and prominent lead selection.
6. Scientific non-diagnostic disclaimer and clinical observations.
"""

import numpy as np
import pytest
from app.preprocessing.spectral import (
    compute_19_channel_spectral_analysis,
    REGIONAL_CHANNEL_MAP,
    FREQUENCY_BANDS,
    STANDARD_19_CHANNELS,
)


def test_standard_19_channels_montage():
    """Verify all 19 channels are defined and correctly distributed across 5 regions."""
    expected_channels = [
        "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",
        "T3", "C3", "Cz", "C4", "T4",
        "T5", "P3", "Pz", "P4", "T6",
        "O1", "O2"
    ]
    assert len(STANDARD_19_CHANNELS) == 19
    for ch in expected_channels:
        assert ch in STANDARD_19_CHANNELS

    # Regional distribution check
    assert len(REGIONAL_CHANNEL_MAP["Frontal"]) == 7
    assert len(REGIONAL_CHANNEL_MAP["Central"]) == 3
    assert len(REGIONAL_CHANNEL_MAP["Temporal"]) == 4
    assert len(REGIONAL_CHANNEL_MAP["Parietal"]) == 3
    assert len(REGIONAL_CHANNEL_MAP["Occipital"]) == 2

    all_regional_chans = [ch for chs in REGIONAL_CHANNEL_MAP.values() for ch in chs]
    assert len(all_regional_chans) == 19
    assert len(set(all_regional_chans)) == 19


def test_spectral_analysis_computation():
    """Verify spectral power and TBR computations on synthetic 19-channel signal."""
    fs = 128.0
    duration = 10.0  # seconds
    n_samples = int(duration * fs)
    t = np.linspace(0, duration, n_samples)

    # 19-channel array: synthetic sinusoids
    signal = np.zeros((n_samples, 19), dtype=np.float32)
    for i in range(19):
        # 6 Hz theta + 20 Hz beta + random noise
        signal[:, i] = 10.0 * np.sin(2 * np.pi * 6.0 * t) + 5.0 * np.sin(2 * np.pi * 20.0 * t) + np.random.normal(0, 0.5, n_samples)

    result = compute_19_channel_spectral_analysis(signal, fs=fs, channel_names=STANDARD_19_CHANNELS)

    assert "electrodes" in result
    assert len(result["electrodes"]) == 19

    # Verify each electrode has all frequency bands and valid TBR
    for ch_name, el in result["electrodes"].items():
        assert el["delta_power"] >= 0.0
        assert el["theta_power"] > 0.0
        assert el["alpha_power"] >= 0.0
        assert el["beta_power"] > 0.0
        assert el["gamma_power"] >= 0.0
        assert el["total_power"] > 0.0
        assert el["tbr"] > 0.0
        assert el["is_available"] is True
        assert el["lobe"] in ["Frontal", "Central", "Temporal", "Parietal", "Occipital"]

    # Verify 5 regions exist
    assert "regions" in result
    assert len(result["regions"]) == 5
    for reg_name in ["Frontal", "Central", "Temporal", "Parietal", "Occipital"]:
        reg = result["regions"][reg_name]
        assert reg["theta_power"] > 0.0
        assert reg["beta_power"] > 0.0
        # Regional TBR must equal regional theta / regional beta
        expected_tbr = round(reg["theta_power"] / max(1e-6, reg["beta_power"]), 2)
        assert abs(reg["tbr"] - expected_tbr) < 0.05

    # Verify prominent channels
    assert "prominent_channels" in result
    assert "tbr" in result["prominent_channels"]
    assert len(result["prominent_channels"]["tbr"]) <= 3

    # Verify metric ranges
    assert "metric_ranges" in result
    for metric in ["tbr", "theta", "beta", "alpha", "delta", "gamma"]:
        assert metric in result["metric_ranges"]
        mr = result["metric_ranges"][metric]
        assert mr["min"] <= mr["max"]
        assert mr["min"] <= mr["mean"] <= mr["max"]

    # Verify non-diagnostic disclaimer
    assert "disclaimer" in result
    assert "Not a Standalone ADHD Diagnosis" in result["disclaimer"]
    assert "observations" in result
    assert len(result["observations"]) > 0


def test_channel_mapping_case_insensitive():
    """Verify channel extraction handles non-standard casing and prefixes."""
    fs = 128.0
    signal = np.ones((1280, 19), dtype=np.float32) * 5.0
    messy_names = [
        "eeg fp1", "FP2", "f7", "F3", "Fz-ref", "f4", "F8",
        "T3", "c3", "CZ", "C4", "t4",
        "T5", "p3", "PZ", "P4", "t6",
        "O1", "o2"
    ]
    result = compute_19_channel_spectral_analysis(signal, fs=fs, channel_names=messy_names)
    assert len(result["electrodes"]) == 19
    for ch in STANDARD_19_CHANNELS:
        assert ch in result["electrodes"]
        assert result["electrodes"][ch]["is_available"] is True
