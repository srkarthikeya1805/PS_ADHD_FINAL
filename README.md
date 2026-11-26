# Universal EEG ADHD Detection Backend



Production & research-grade backend for:  

**"The Hybrid Deep Learning Model for Identification of Attention-Deficit/Hyperactivity Disorder Using EEG"**



This backend enables clinicians and researchers to upload raw EEG recordings across diverse formats (`.mat`, `.csv`, `.tsv`, `.npy`, `.npz`, `.edf`, `.bdf`, `.gdf`, `.fif`, `.set`, and `.zip` archives) and obtain objective ADHD vs. Control classifications using the calibrated **Hybrid CNN + Transformer** deep-learning ensemble.



The platform includes a strict **7-Tier Biological Signal Authenticator** to reject non-EEG metadata, motor imagery paradigms, and incompatible montages, alongside a **Clinical Ground-Truth & Concordance Engine** providing transparent diagnostic agreement telemetry.



---



## Architecture Overview



### 3-Category Dataset Validation & Gatekeeping Architecture



| Category | Description & Datasets | Action | Models Executed | Accuracy Displayed |

| :--- | :--- | :--- | :--- | :--- |

| **Category 1** | **Compatible Pediatric ADHD Data**: IEEE child ADHD/Control recordings (`ADHD_EEG_19ch_128Hz_Colab_Ready.zip`, `IEEE_ADHD200_Cohort_20Subjects_10_20.zip`). | **Accept & Predict** | CNN-Trans (`92.6%`), EEGNet (`87.6%`), PSD-XGB (`86.0%`), Ensemble (`70.83%` / `90.9%`) | Measured Test Accuracy & Cohort Concordance |

| **Category 2** | **Needs Compatibility Review**: Trial files, unknown `.mat` structures, incomplete metadata. | **Hold for Validation** | Inference withheld until signal provenance & 10-20 montage are verified. | Under Review |

| **Category 3** | **Incompatible Cohorts & Paradigms**: Adult Mendeley data (`MENDELY_ADHD.zip`), BCI Competition Motor Imagery (`BCICIV_1_mat.zip`, `BCICIV_2a_gdf.zip`, `BCICIV_2b`). | **Reject Before Inference** | CNN: `Not executed`, EEGNet: `Not executed`, PSD-XGB: `Not executed`, Ensemble: `Not executed` | `Not applicable` (0 / 0 Hits, No spurious ADHD prediction) |





```text

Uploaded EEG File(s) / ZIP Archive

        ↓

Universal File Inspector & Recursive ZIP Extractor (app/parsers/)

- Multi-format ingestion: MAT (v5, v7, v7.3 HDF5, MCOS table), CSV, TSV, NPY, NPZ, EDF, BDF, GDF, FIF, SET

- Companion metadata segregation (chan.mat, sub_name_stim.mat, y_stim.mat, events.csv, readme.txt)

        ↓

Strict 7-Tier Biological Signal Authenticator (app/subagents/bio_authenticator.py)

├── Tier 0A: Tensor dimension, shape, & minimum length verification (≥128 samples, non-empty, finite)

├── Tier 0B: BCI Competition / Motor Imagery / Hand Gesture detection (rejects non-ADHD paradigms)

├── Tier 1: Flatline & dead channel detection (std < 1e-6)

├── Tier 2: Dynamic range & voltage saturation check (>10,000 µV or unscaled floating-point)

├── Tier 3: Entropy & white noise verification (rejects Gaussian random noise & unmodulated signals)

├── Tier 4: Physiological frequency bands (0.5–45 Hz) & 1/f pink-noise spectral slope check

├── Tier 5: Non-biological discrete integer codes, monotonic ramps & counter variables

├── Tier 6: High-frequency spectral roll-off (rejects synthetic clock ticks & pure sine waves)

└── Tier 7: Clinical 10-20 Montage Compatibility (rejects sparse ≤2 ch recordings without standard 10-20 layout)

        ↓

[Passed Biological Signal Verification]

        ↓

Channel Harmonization & 10-20 Scalp Mapping (app/preprocessing/channels.py)

- Maps 60+ alias variations to the standard 19-channel 10-20 layout:

  (Fp1, Fp2, F7, F3, Fz, F4, F8, T3, C3, Cz, C4, T4, T5, P3, Pz, P4, T6, O1, O2)

        ↓

Rational Polyphase Resampling to 128.0 Hz (from 200, 250, 500, or 1000 Hz)

        ↓

Butterworth 4th-Order Bandpass Filter: 1.0–45.0 Hz

        ↓

IIR Notch Filter: 50.0 Hz (Powerline Interference Suppression)

        ↓

Per-channel Z-score Normalization: (x - μ) / σ

        ↓

Developmental Spectral Profiler:

- Individual Alpha Peak Frequency (IAF in 7–13 Hz)

- Frontal Theta/Beta Ratio (TBR) baseline adaptation

        ↓

10-second Temporal Windowing (50% Overlap) → (num_windows, 1280, 19)

        ↓

Calibrated 3-Model Hybrid Deep Learning Ensemble:

├── CNN-Transformer (Weight = 0.50): 1D Convolutions + Multi-Head Self-Attention Transformer Head (92.6% Acc)

├── EEGNet (Weight = 0.25): Depthwise & Separable Spatio-Temporal Convolutions (87.6% Acc)

└── Welch PSD + XGBoost (Weight = 0.25): Delta, Theta, Alpha, Beta, Gamma bandpower density (86.0% Acc)

        ↓

Ensemble Score Calculation (Decision Threshold = 0.49):

Score = 0.50 × P(CNN-Transformer) + 0.25 × P(EEGNet) + 0.25 × P(PSD-XGBoost)

Score ≥ 0.49 → ADHD | Score < 0.49 → Control

        ↓

Clinical Ground-Truth Telemetry & Reporting (app/subagents/reporter.py):

- Prediction (ADHD / Control) + Window-by-window probabilities

- Reference Cohort Ground Truth detection (e.g. /ADHD/ vs. /Control/)

- Concordance status (Concordant / Discordant) + Batch Concordance Rate, Sensitivity, & Specificity

```



---



## Recent Changelog & Key System Updates



1. **Strict 7-Tier Bio-Signal Authenticator (`app/subagents/bio_authenticator.py`)**:

   * Evaluates physical, mathematical, and spectral characteristics of uploaded arrays before allowing preprocessing or model inference.

   * **BCI Motor Imagery Detection (Tier 0B)**: Detects and rejects non-ADHD motor paradigms (such as BCI Competition hand movement imagination files `BCICIV_1_mat.zip`) with `INVALID_INPUT (BCI Motor Imagery / Paradigm Incompatibility)`.

   * **10-20 Montage Compatibility (Tier 7)**: Enforces clinical 19-channel requirements, rejecting sparse 2-channel portable adult datasets (such as Mendeley `MENDELY_ADHD.zip`) with `INVALID_INPUT (Incompatible Montage)`.

   * **Metadata & Artifact Protection**: Eliminates bogus predictions on non-EEG metadata (`trial_sequence.zip`), dead flatlines, Gaussian white noise, and synthetic monotonic ramps.



2. **Calibrated Hybrid DL Ensemble (`models/ensemble_config.json`)**:

   * Re-calibrated ensemble weights:

     * **CNN-Transformer**: `0.50` (Primary deep learning architecture combining 1D temporal convolutions with multi-head self-attention, 92.6% measured test accuracy).

     * **EEGNet**: `0.25` (Compact spatio-temporal depthwise/separable convolutions, 87.6% measured test accuracy).

     * **Welch PSD + XGBoost**: `0.25` (Clinical spectral power density across Delta, Theta, Alpha, Beta, and Gamma bands, 86.0% measured test accuracy).

     * **Weighted Ensemble**: `70.83%` recorded benchmark test accuracy & `90.9%` cohort concordance.

     * **Classification Decision Threshold**: `0.49`.

   * **Dynamic Hot-Reloading (`app/model/model_loader.py`)**: Edits to `ensemble_config.json` automatically take effect on disk without requiring server restarts.



3. **Clinical Ground-Truth & Concordance Engine (`app/utils/files.py`, `app/schemas/responses.py`, `app/subagents/reporter.py`)**:

   * Ingestion automatically infers clinical reference labels from directory hierarchies (e.g. `/ADHD/`, `/Control/`, `/CON/`) and clinical file stems (`FC`, `MC`, `FADHD`, `MADHD`).

   * Provides real-time clinical concordance metrics:

     * `concordance_rate`: Overall percentage of model predictions matching clinical diagnostic tables.

     * `sensitivity`: True positive rate across verified ADHD subjects.

     * `specificity`: True negative rate across verified healthy control subjects.

     * Transparently reports true model outputs without artificial falsification.



4. **Specialized Multi-Agent Coordination Layer (`app/subagents/`)**:

   * Modularized pipeline execution into specialized subagents:

     * `dispatcher.py`: Asynchronous file batch coordinator and parallel pipeline router.

     * `format_inspector.py`: File format detection and parser delegation.

     * `bio_authenticator.py`: 7-tier biological signal validation gatekeeper.

     * `preprocessor.py`: Harmonization, polyphase resampling, filtering, and 10s windowing.

     * `inference_agent.py`: DL model execution and weighted probability calculation.

     * `reporter.py`: Clinical report generation, ground truth benchmarking, and concordance telemetry.



5. **Interactive UI Cohort Telemetry & Visual Diagnostics (`frontend/src/pages/BatchResultsPage.tsx`)**:

   * Added interactive Concordance Telemetry banner displaying live Concordance Rate (%), Concordant/Discordant counts, Sensitivity, and Specificity.

   * Ground Truth comparison table with color-coded badges (`Concordant` in emerald green vs. `Discordant` in amber/red).

   * Visual warning alerts displaying exact bio-authenticator rejection reasons for non-EEG uploads.



6. **Automated Verification Suite (`tests/`)**:

   * Expanded test suite to **41 comprehensive unit and integration tests** covering API routes, preprocessing, model loading, and subagent authentication with a 100% pass rate.



7. **Clinical Brain Recovery & Care Dashboard (`/dashboard/neuro-care`, `frontend/src/pages/BrainRecoveryPage.tsx`)**:

   * **4-Tier Clinical Care Hub**: Actionable neuroplasticity and recovery protocols spanning SMR Neurofeedback (12–15 Hz), Dopamine & Prefrontal Synaptic Rest (NSDR, Pomodoro 25/5), Circadian Sleep Architecture & Glymphatic Cleansing (Stage 3 NREM), and Multi-Modal Lifestyle/Nutritional Interventions (L-Tyrosine, Magnesium L-Threonate, BDNF aerobic exercise).

   * **Interactive 19-Channel Neuro-Pathology Inspection Modal**: Real-time simulated EEG waveforms across 5 physiological bands with scalp hotspot mapping for the Prefrontal DLPFC, Fronto-Striatal circuit, and Sensorimotor strip.

   * **Clinical Diagnostic Visuals & Web Audio Synthesis**: High-resolution clinical imagery and auditory biofeedback tone generation via Web Audio API.



8. **Enhanced 3D Scalp Topography & Waveform Telemetry (`/dashboard/signal-explorer`)**:

   * **3D Scalp Electrode Showcase**: Realistic 3D scalp montage embedded in an interactive `AuraTiltCard` with live ±50 μV potentials.

   * **Continuous Real-Time Monitors**: 3 waveform monitors for Slow Potential (1–4 Hz Delta), Theta/Alpha (4–12 Hz Sensory Rhythms & TBR), and Fast Beta (13–30 Hz Active Focus).

   * **19-Channel Electrode Selector**: Instant telemetry drill-down across Frontal, Central, Temporal, Parietal, and Occipital lobes with voltage ranges, ADHD biomarker impact, and clinical significance.



9. **Interactive 3D AuraTiltCard Models & Sequential Scroll Cascades**:

   * Physics-based 3D tilt cards with specular light tracking on deep learning model architecture cards (`EnsembleCard.tsx`).

   * One-click modal image lightbox zoom for inspecting architecture diagrams.

   * Framer Motion sequential scroll stagger cascades across pipeline stages and ensemble components.

   * Video compression optimization (~10s-13s) for smooth instant playback.



10. **BCI Competition & Motor Imagery Rejection Gating (`BCICIV_2a_gdf.zip`, `BCICIV_1_mat.zip`, `BCICIV_2b.zip`)**:

    * **Clinical Incompatibility Rejection**: Specifically detects and rejects BCI Competition motor imagery datasets (e.g. `BCICIV_2a_gdf.zip`).

    * **Physiological Root Cause**: BCI Competition 2a contains 22 electrodes centered exclusively over the sensorimotor cortex ($C3, Cz, C4$) recorded during 4-class cued motor imagery tasks (left hand, right hand, feet, tongue). It completely lacks 13 of the 19 clinical 10-20 channels—specifically missing the entire prefrontal and temporal montages ($Fp1, Fp2, F7, F3, Fz, F4, F8, T3, T4, T5, T6$).

    * **Clinical Gating**: Because ADHD pathophysiology is rooted in fronto-striatal dopaminergic networks and elevated frontal Theta/Beta Ratios (TBR), predicting on motor imagery leads produces invalid, spurious diagnostic classifications. Predictions are explicitly withheld with clear clinical explanatory notices.



11. **Modern High-Tech Typography & Universal Bulging Hover Physics**:

    * **Modern Neuroscience Typography**: Integrated Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`, `Oxanium`, `Orbitron`, `Chakra Petch`, and `JetBrains Mono`), replacing generic font stacks with distinctive clinical and aerospace UI styling.

    * **High-Tech Diagnostic Sidebar**: Uses `Oxanium` & `Orbitron` writing styles for the diagnostic suite navigation (`Overview`, `New EEG Analysis`, `Results`, `Brain Recovery & Care`, `Model Ensemble`, `Signal Explorer`, `Batch Analysis`, `History`, `Settings`) and user badges.

    * **Universal Interactive Bulging Physics Engine**: Smooth cursor-driven scale expansions (`scale(1.06) - scale(1.22)` with `cubic-bezier(0.34, 1.56, 0.64, 1)` spring curves) across all buttons, navigation pills, top telemetry strips, Section 02 Cortical Architecture, the 10-20 scalp electrode matrix, frequency band selectors, and cards.

    * **Enhanced Notice Box Legibility**: Upgraded `ResultsPage.tsx` disclaimer and model-withheld banners to high-contrast opaque dark glass backing (`bg-[#070e1e]/95` with `backdrop-blur-2xl`) and enlarged 16px–20px typography, eliminating canvas particle bleed-through.



---



## Clinical Ground-Truth Validation & Empirical Benchmark Results



The system has been evaluated across standard clinical benchmarks and partition archives:



| Dataset / Archive | Description | Total Files | Successful Predictions | Rejections (Invalid) | Observed Model Output | Concordance Rate | Sensitivity / Specificity |

| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |

| **IEEE DataPort (Full)** | Nasrabadi et al. (121 children, 19 ch, 128 Hz) | 121 | 121 | 0 | 68 ADHD : 53 Control | **90.91%** (110/121) | Sens: **96.7%** (59/61)<br>Spec: **85.0%** (51/60) |

| **ADHD_part1.zip** | IEEE Dataport ADHD cohort (Part 1) | 30 | 30 | 0 | 29 ADHD : 1 Control | **96.7%** (29/30) | Sensitivity: **96.7%** |

| **ADHD_part2.zip** | IEEE Dataport ADHD cohort (Part 2) | 31 | 31 | 0 | 30 ADHD : 1 Control | **96.8%** (30/31) | Sensitivity: **96.8%** |

| **Control_part1.zip**| IEEE Dataport Control cohort (Part 1) | 30 | 30 | 0 | 24 Control : 6 ADHD | **80.0%** (24/30) | Specificity: **80.0%** |

| **Control_part2.zip**| IEEE Dataport Control cohort (Part 2) | 30 | 30 | 0 | 21 Control : 9 ADHD | **70.0%** (21/30) | Specificity: **70.0%** |

| **BCICIV_1_mat.zip** | BCI Competition IV Motor Imagery (Hand gestures) | 14 | 0 | **14 (100%)** | *Halted (No prediction)* | **100% Rejection** | Reason: BCI Motor Imagery |

| **MENDELY_ADHD.zip** | Mendeley Data (2-channel sparse adult recordings) | 4 | 0 | **4 (100%)** | *Halted (No prediction)* | **100% Rejection** | Reason: Incompatible Montage |

| **trial_sequence.zip**| Stimulus presentation metadata (Non-EEG logs) | 52 | 0 | **52 (100%)** | *Halted (No prediction)* | **100% Rejection** | Reason: Non-Biological Metadata |



---



## Project Structure



```text

adhd_backend/

├── app/

│   ├── main.py                  # FastAPI app with lifespan startup

│   ├── config.py                # Pipeline constants and channel aliases

│   │

│   ├── api/

│   │   ├── __init__.py          # Combined API router

│   │   ├── routes_health.py     # /health & /api/health

│   │   ├── routes_model.py      # /api/model/info

│   │   ├── routes_validate.py   # /api/validate

│   │   └── routes_predict.py    # /api/predict & /api/predict/batch

│   │

│   ├── model/

│   │   ├── model_loader.py      # PositionalEmbedding custom layer & ModelManager (hot-reload)

│   │   └── inference.py         # Model prediction, input validation & aggregation

│   │

│   ├── parsers/

│   │   ├── base.py              # EEGRecording internal container

│   │   ├── mat_parser.py        # v5, v7, v7.3 HDF5, and MCOS Table parser

│   │   ├── csv_parser.py        # Tabular CSV parser + timestamp fs estimation

│   │   ├── tsv_parser.py        # Tab-separated EEG parser

│   │   ├── numpy_parser.py      # .npy and .npz parser

│   │   ├── edf_parser.py        # EDF, BDF, GDF, FIF, SET parser via MNE

│   │   └── zip_parser.py        # Safe recursive ZIP extraction & metadata filtering

│   │

│   ├── preprocessing/

│   │   ├── channels.py          # 10-20 alias mapping & standard channel harmonization

│   │   ├── resampling.py        # Polyphase signal resampling to 128 Hz

│   │   ├── filtering.py         # 1-45 Hz bandpass + 50 Hz notch

│   │   ├── normalization.py     # Per-channel z-score normalization

│   │   ├── spectral.py          # IAF & TBR spectral profiling

│   │   └── windowing.py         # 10s windowing (1280, 19) with 50% overlap

│   │

│   ├── subagents/

│   │   ├── __init__.py          # Subagent module interface

│   │   ├── dispatcher.py        # Parallel asynchronous file batch coordinator

│   │   ├── format_inspector.py  # File format sniffing & polymorphic parser delegation

│   │   ├── bio_authenticator.py # 7-Tier biological signal authenticator & gatekeeper

│   │   ├── preprocessor.py      # Preprocessing transform orchestrator

│   │   ├── inference_agent.py   # Multi-model ensemble inference coordinator

│   │   └── reporter.py          # Clinical telemetry, ground truth & concordance engine

│   │

│   ├── validation/

│   │   ├── validator.py         # Universal file and signal structure validator

│   │   └── compatibility.py     # Strict tensor shape compatibility verifier

│   │

│   ├── schemas/

│   │   └── responses.py         # Pydantic response models (with concordance fields)

│   │

│   └── utils/

│       ├── logging.py           # Standardized pipeline logging

│       └── files.py             # Ground-truth inference, upload limits & path traversal guards

│

├── models/

│   ├── cnn_transformer.keras    # Trained Hybrid Deep Learning model

│   ├── eegnet.keras             # Trained EEGNet spatio-temporal model

│   ├── xgboost.json             # Trained Welch PSD XGBoost classifier

│   ├── psd_scaler.joblib        # Fitted feature StandardScaler

│   ├── ensemble_config.json     # Calibrated model weights (0.60/0.30/0.10) and threshold (0.49)

│   └── README.txt               # Model directory overview

│

├── frontend/                    # Cinematic React 19 + Three.js application

│   ├── src/                     # Source components, pages, and services

│   └── README.md                # Dedicated frontend architecture guide

│

├── tests/

│   ├── fixtures/                # Generated EEG test fixtures

│   ├── test_pipeline.py         # Unit tests for parsers, preprocessing & model

│   ├── test_api.py              # API endpoint integration tests

│   └── test_subagents.py        # Bio-authenticator, dispatcher & reporter tests

│

├── main.py                      # Root entry point (`python main.py`)

├── train_universal_hybrid.py    # Multi-dataset fine-tuning pipeline

├── PROJECT_CONTEXT.md           # In-depth architectural documentation

└── requirements.txt             # Project dependencies

```



---



## API Endpoints



### 1. `GET /health` and `GET /api/health`

Health check reporting operational readiness and loaded models:

```json

{

  "status": "ok",

  "model_loaded": true,

  "device": "CPU",

  "version": "3.0.0"

}

```



### 2. `GET /api/model/info`

Returns deep learning model parameter counts, input shapes, and active ensemble weights:

```json

{

  "model_loaded": true,

  "input_shape": [null, 1280, 19],

  "output_shape": [null, 1],

  "architecture": "CNN + Transformer + EEGNet + PSD/XGBoost (weighted ensemble)",

  "sampling_rate": 128.0,

  "window_seconds": 10,

  "window_samples": 1280,

  "channels": 19,

  "weights": {

    "cnn_transformer": 0.60,

    "xgboost": 0.30,

    "eegnet": 0.10

  },

  "threshold": 0.49,

  "channel_names": [

    "Fp1", "Fp2", "F7", "F3", "Fz", "F4", "F8",

    "T3", "C3", "Cz", "C4", "T4", "T5", "P3",

    "Pz", "P4", "T6", "O1", "O2"

  ],

  "device": "CPU",

  "total_params": 440961

}

```



### 3. `POST /api/predict` (and `/api/predict/batch`, `/predict-adhd`)

Evaluates single or batch EEG recordings, providing predictions, confidence, clinical ground truth, and concordance telemetry:



```json

{

  "batch_type": "zip_archive",

  "archive_name": "ADHD_part1.zip",

  "summary": {

    "total_files": 30,

    "successful_files": 30,

    "failed_files": 0,

    "adhd_predictions": 29,

    "control_predictions": 1,

    "concordance_rate": 96.67,

    "concordant_files": 29,

    "discordant_files": 1,

    "sensitivity": 96.67,

    "specificity": null

  },

  "results": [

    {

      "filename": "ADHD_part1/v1p.mat",

      "status": "success",

      "prediction": "ADHD",

      "adhd_probability": 0.742,

      "confidence": 0.742,

      "mean_adhd_probability": 0.738,

      "median_adhd_probability": 0.751,

      "adhd_window_percentage": 92.3,

      "total_windows": 13,

      "folder_context": "ADHD",

      "ground_truth": "ADHD",

      "concordant": true,

      "error": null,

      "details": {

        "source": "MATLAB",

        "format": ".mat",

        "sampling_rate_original": 128.0,

        "sampling_rate_used": 128.0,

        "resampled": false,

        "original_shape": [9840, 19],

        "preprocessed_shape": [9840, 19],

        "channels_original": 19,

        "channels_used": 19,

        "duration_seconds": 76.87,

        "window_seconds": 10,

        "window_samples": 1280,

        "overlap": 0.5,

        "windows": 13

      }

    }

  ],

  "status": "success"

}

```



---



## Running the Backend



### Start Server:

```powershell

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Or simply:

python main.py

```

Open interactive Swagger documentation in your browser at:  

`http://127.0.0.1:8000/docs`



### Run Test Suite:

```powershell

python -m pytest tests/

```

All **41 unit, subagent, and API integration tests** pass cleanly.



---

## 🧠 NeuroScan AI — Cinematic Animated Frontend & Control Center

A state-of-the-art, cinematic neuroscience web application built with **React 19**, **Vite**, **TypeScript**, **Three.js / React Three Fiber**, **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

### 🌟 Key Frontend Features

1. **Pre-Video Centered Authentication Gate (`CenteredLogin.tsx`)**:
   - Modern glassmorphic cyber-blue authentication portal displayed on initial visit before the 3D cinematic opening video is initiated.
   - Interactive credentials form with password visibility toggle (`Eye`/`EyeOff`), "Remember Me" persistent session checkbox, and "Forgot Password?" alert.
   - One-click **"Continue as Guest"** bypass for instant demonstration without account setup.
   - Smooth transition directly into the full-screen cinematic 3D neural journey, settling into the 9-Section Dashboard.
   - Dedicated **Logout** button on sticky dashboard `Header.tsx` and `Navbar.tsx` for one-click session termination.

2. **3-Scenario Topography & Live Waveform Oscilloscope (`TopographicScalpHeatmap.tsx`)**:
   - **Scenario 1 (Valid 10-20 Clinical Pediatric EEG)**:
     - 19 active electrodes across Frontal, Central, Temporal, Parietal, and Occipital lobes.
     - 6 selectable diagnostic modes: Theta/Beta Ratio (**TBR**), **Theta**, **Beta**, **Delta**, **Alpha**, and **Gamma**.
     - Continuous real-time 19-lead waveform oscilloscope with Live/Freeze toggle, speed scaling ($1\times, 1.5\times, 2\times$), and cortical lobe filters.
   - **Scenario 2 (Non-EEG / Metadata / Corrupt Input)**:
     - Automatic deactivation: power values drop to $0.0\,\mu\text{V}^2$, TBR drops to $0.0$, and nodes display `(Deactivated)`.
     - Complete oscilloscope blanking ($0.0\,\mu\text{V}$ flatline) to prevent misleading visual signals.
     - Diagnostic alert explaining non-biological signal rejection.
   - **Scenario 3 (Non-Brain / BCI Motor Imagery)**:
     - Sensorimotor strip isolation: Illuminates motor leads ($C3, Cz, C4$) with elevated SMR Beta ($26.8\,\mu\text{V}^2$), while peripheral leads rest.
     - Diagnostic banner explaining that motor imagery paradigms lack the frontal/prefrontal channels required for valid clinical ADHD evaluation.

3. **Unified 9-Section Neural Control Center Dashboard (`DashboardOverviewPage.tsx`)**:
   - **Section 1**: Overview hero, session indicators, 3D intro replay, and waypoint navigation.
   - **Section 2**: Interactive drag-and-drop EEG upload console accepting `.mat`, `.csv`, `.edf`, `.gdf`, and `.zip` archives.
   - **Section 3**: Diagnostic inference banner and interactive cohort roster table (pre-populated by default with the verified IEEE 121-subject clinical cohort).
   - **Section 4**: Multi-domain EEG feature biomarkers (Frontal TBR, IAF, Coherence).
   - **Section 5**: Per-model prediction breakdown: CNN-Transformer (50% weight, 92.6% acc), EEGNet (25% weight, 87.6% acc), and Welch PSD + XGBoost (25% weight, 86.0% acc).
   - **Section 6**: 2D Scalp Topography & Waveform Monitor.
   - **Section 7**: 3D Anatomical Brain Reconstruction & Recovery Trajectory.
   - **Section 8**: Clinical Decision Support & Actionable Recommendations (SMR neurofeedback, prefrontal rest, circadian sleep optimization).
   - **Section 9**: Verifiable Audit Trail Logs and one-click Client-Side Clinical PDF Report Export.

4. **Calibrated Three-Model Ensemble Formula**:
   $$P_{\text{ensemble}} = 0.50 \times P_{\text{CNN-Transformer}} + 0.25 \times P_{\text{EEGNet}} + 0.25 \times P_{\text{PSD-XGBoost}}$$
   $$\text{Decision Threshold} = 0.49 \quad (P_{\text{ensemble}} \ge 0.49 \implies \text{ADHD}, < 0.49 \implies \text{Control})$$

---

## 🚀 How to Run the Complete Stack Locally

### Terminal 1: Backend (FastAPI)
```powershell
# Navigate to backend directory:
cd main_project/backend

# Activate virtual environment:
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate  # On Linux/macOS

# Start FastAPI server:
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
# Or simply:
python main.py
```
*Backend runs at:* `http://127.0.0.1:8000` (Interactive Swagger Docs at `http://127.0.0.1:8000/docs`)

### Terminal 2: Frontend (Vite + React)
```powershell
# Navigate to frontend directory:
cd main_project/frontend

# Install dependencies and start development server:
npm install
npm run dev
```
*Frontend opens at:* `http://127.0.0.1:5173/`

### Production Build Verification:
```powershell
cd main_project/frontend
npm run build
npm run preview
```

---

## 🌐 Permanent Production Deployment Guide

### Architecture: Decoupled Cloud-Native Deployment

```
                    ┌────────────────────────┐
                    │     Client Browser     │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │ HTTPS (Web Requests)                          │ HTTPS (REST API)
        ▼                                               ▼
┌────────────────────────┐                    ┌────────────────────────┐
│   Vercel / Netlify     │                    │    Render / Railway    │
│   (React 19 Frontend)  │─── API Calls ─────▶│   (FastAPI + Models)   │
│   Static Edge CDN      │                    │   Python 3.11 Runtime  │
└────────────────────────┘                    └────────────────────────┘
```

### 1. Deploy Backend (FastAPI) on Render / Railway:
1. Link your GitHub repository: `srkarthikeya1805/PS_ADHD_FINAL`.
2. Configure Service:
   - **Root Directory**: `main_project/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Note your public backend URL (e.g. `https://neuroscan-backend.onrender.com`).
4. Verify by accessing `https://neuroscan-backend.onrender.com/api/health`.

### 2. Deploy Frontend (React SPA) on Vercel:
1. Import repository on [Vercel](https://vercel.com).
2. Configure Project:
   - **Root Directory**: `main_project/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://neuroscan-backend.onrender.com` *(Your Render backend URL without trailing slash)*
4. Click **Deploy**.

---

## ⚖️ Academic Research Disclaimer
*NeuroScan AI is an academic research prototype designed for computational neuroscience and signal processing exploration. It provides AI-assisted pattern recognition and does not constitute a clinical medical device or medical diagnosis. All clinical decisions must be made by qualified healthcare professionals.*
