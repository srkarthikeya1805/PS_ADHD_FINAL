# 🧠 NeuroScan AI — Frontend

A state-of-the-art, cinematic neuroscience web application built with **React 19**, **Vite**, **TypeScript**, **Three.js / React Three Fiber**, **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

NeuroScan AI pairs directly with the [Universal EEG ADHD Detection Backend](../backend/README.md) to provide clinical researchers, computational neuroscientists, and lab evaluators with real-time bio-signal validation, multi-model ensemble predictions, 19-channel 10-20 waveform exploration, and cohort concordance telemetry.

---

## 🌟 Key Application Features

### 1. Pre-Video Centered Authentication Gate (`src/components/auth/CenteredLogin.tsx`)
* **Cyber-Clinical Design**: Centered glassmorphic login card appearing directly on application load before the 3D cinematic opening video is initiated.
* **Authentication Controls**:
  * Email Address & Password input with interactive visibility toggle (`Eye` / `EyeOff`).
  * "Remember Me" persistent session toggle via `localStorage`.
  * "Forgot Password?" email recovery dispatch alert.
  * Form validation with dynamic submission states.
  * **"Continue as Guest"**: One-click bypass for instant clinical evaluation without credential requirements.
* **Seamless Cinematic Transition**: Authenticating or selecting guest immediately launches the full-screen cinematic 3D neural journey, which smoothly settles into the 9-Section Control Center Dashboard.
* **Session Management & Logout**: Dedicated `Logout` pill buttons integrated in both the sticky dashboard `Header.tsx` and `Navbar.tsx` for one-click session termination and return to the login portal.

### 2. 3-Scenario Topographic Scalp Heatmap & Waveform Monitor (`src/components/charts/TopographicScalpHeatmap.tsx`)
* **Scenario 1: Valid 10-20 Clinical Pediatric EEG** (`.mat`, `.csv`, `.edf`, `.gdf`, `.zip`):
  * Fully illuminated 19 standard electrodes (Fp1–O2) across 5 cortical lobes.
  * 6 selectable diagnostic metric modes: Theta/Beta Ratio (**TBR**), **Theta** (4–8 Hz), **Beta** (13–30 Hz), **Delta** (0.5–4 Hz), **Alpha** (8–13 Hz), and **Gamma** (30–45 Hz).
  * Prominent prominent channels analysis highlighting key Frontal/Central biomarkers ($Fz, Cz, F3, F4$).
  * Real-time 19-lead animated waveform oscilloscope with Live/Freeze toggle, playback speed adjustment ($1\times, 1.5\times, 2\times$), and cortical lobe filters (All, Frontal, Central, Temporal, Parietal, Occipital).
* **Scenario 2: Non-EEG Metadata / Corrupted / Incompatible Signals**:
  * **Complete Deactivation**: All 19 electrode power values drop to $0.0\,\mu\text{V}^2$, TBR drops to $0.0$, and nodes display `(Deactivated)` status.
  * **Blanked Oscilloscope**: Signal traces are flattened to $0.0\,\mu\text{V}$ flatline, completely suppressing false visual waveforms.
  * Rejection banner displays exact physical reason (e.g. *Task Metadata / Short Trial Log*, *Sample length < 2.5s*).
* **Scenario 3: Non-Brain / BCI Motor Imagery / Hand Gesture Datasets**:
  * **Sensorimotor Strip Isolation**: Illuminates specifically the motor cortex leads ($C3, Cz, C4$) showing elevated Sensorimotor Rhythm (SMR) Beta ($26.8\,\mu\text{V}^2$).
  * Peripheral frontal/temporal leads remain in resting baseline state.
  * Clinical advisory banner explains that motor imagery paradigms lack the frontal montage required for valid ADHD cognitive assessment.

### 3. Unified 9-Section Neural Control Center Dashboard (`src/pages/DashboardOverviewPage.tsx`)
* **Section 1: Starting Overview Page**: Hero banner with live session status, audio synthesizer toggle, 3D intro replay button, and quick jump buttons.
* **Section 2: Interactive EEG Upload & Validation Console**: Drag-and-drop file ingestion supporting `.mat`, `.csv`, `.edf`, `.gdf`, and `.zip` archives. Includes quick-load buttons for built-in research fixture cohorts.
* **Section 3: Primary Diagnostic Inference Banner & Cohort Roster Table**: Prominent probability gauge, ADHD vs. Control diagnosis, confidence score, and interactive multi-subject roster table. Pre-populated by default with the verified IEEE 121-subject clinical cohort.
* **Section 4: Multi-Domain EEG Feature Biomarkers**: Frontal Theta/Beta Ratio (TBR), Individual Alpha Peak Frequency (IAF), and Delta/Gamma coherence gauges.
* **Section 5: Per-Model Prediction Accuracy & Clinical Breakdown**: Individual model cards for CNN-Transformer (50% weight, 92.6% acc), EEGNet (25% weight, 87.6% acc), and Welch PSD + XGBoost (25% weight, 86.0% acc).
* **Section 6: 2D Scalp Topography & Waveform Monitor**: Dynamic 3-scenario 19-channel scalp map and synchronized oscilloscope.
* **Section 7: 3D Anatomical Brain Reconstruction & Recovery Trajectory**: Procedural 3D brain with cortical lobe hotspot inspection and interactive clinical care protocols.
* **Section 8: Clinical Decision Support & Actionable Recommendations**: Evidence-based therapeutic interventions (SMR neurofeedback, prefrontal rest, circadian sleep architecture).
* **Section 9: Audit Trail, Verification Logs & PDF Export**: Client-side clinical PDF report generator (`html2canvas` + `jspdf`) and verifiable audit trail logs.

### 4. Direct-to-Workspace Scientific Landing Page (`src/pages/LandingPage.tsx`)
* **Dynamic 3D Procedural Brain Mesh**: Dual-hemisphere geometry with vertex displacement shaders, electrical synaptic pulses, and interactive cortical lobe highlighting.
* **Hardware Resilience**: Automated WebGL context-loss detection with seamless 2D canvas fallback (`BrainFallback.tsx`).

---

## 🛠️ Technology Stack

| Domain | Libraries & Frameworks |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/), [Vite 6](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), Cyber-blue glassmorphism tokens |
| **3D Graphics** | [Three.js](https://threejs.org/), [React Three Fiber](https://r3f.docs.pmnd.rs/), [React Three Drei](https://github.com/pmndrs/drei) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Data Visualization** | [Recharts](https://recharts.org/), Custom HTML5 Canvas Oscilloscope, SVG Topography |
| **Reporting** | [jspdf](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Routing & State** | [React Router v7](https://reactrouter.com/), Context API, LocalStorage persistence |

---

## 🚀 How to Run Frontend Locally

```bash
cd main_project/frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Production Build:
```bash
npm run build
npm run preview
```

---

## 🌐 Permanent Deployment Guide

### Deploying on Vercel:
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `main_project/frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   * `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com` (Your deployed FastAPI backend URL, without trailing slash).
5. Click **Deploy**.

---

## ⚖️ Academic Research Disclaimer
*NeuroScan AI is an academic research prototype designed for computational neuroscience and signal processing exploration. It provides AI-assisted pattern recognition and does not constitute a clinical medical device or medical diagnosis. All clinical decisions must be made by qualified healthcare professionals.*
