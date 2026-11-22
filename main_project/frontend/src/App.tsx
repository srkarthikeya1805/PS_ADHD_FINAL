import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NeuralBackground } from './components/common/NeuralBackground';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { LandingPage } from './pages/LandingPage';
import { CinematicOpeningIntro } from './components/intro/CinematicOpeningIntro';

import { clearSession, getSession } from './services/storage';

// Context to allow replaying the cinematic opening from any navbar or button
export const IntroContext = createContext<{
  replayIntro: () => void;
  showIntro: boolean;
  introTrigger: number;
  introPhase: 'login' | 'intro' | 'traveling' | 'settled';
  setIntroPhase: (phase: 'login' | 'intro' | 'traveling' | 'settled') => void;
  logout: () => void;
}>({
  replayIntro: () => { },
  showIntro: true,
  introTrigger: 0,
  introPhase: 'login',
  setIntroPhase: () => { },
  logout: () => { },
});

export const useIntro = () => useContext(IntroContext);

export function App() {
  const [introTrigger, setIntroTrigger] = useState(0);
  const [introPhase, setIntroPhase] = useState<'login' | 'intro' | 'traveling' | 'settled'>(() => {
    try {
      // If user has an active logged-in session and already completed intro
      const hasSession = !!getSession();
      const introDone = !!sessionStorage.getItem('neuroscan_intro_viewed');
      if (hasSession && introDone) return 'settled';
      // User must see the login page first as requested
      return 'login';
    } catch {
      return 'login';
    }
  });

  const replayIntro = () => {
    try {
      sessionStorage.removeItem('neuroscan_intro_viewed');
    } catch {}
    setIntroPhase('intro');
    setIntroTrigger((prev) => prev + 1);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('neuroscan_intro_viewed');
    } catch {}
    clearSession();
    setIntroPhase('login');
  };

  const showIntro = introPhase !== 'settled';

  return (
    <IntroContext.Provider value={{ replayIntro, showIntro, introTrigger, introPhase, setIntroPhase, logout }}>
      <div className="min-h-screen bg-[#030914] text-[#F3F8FF] relative">
        <BrowserRouter>
          {/* Persistent Dark Blue Neural Nerve Background on Every Route */}
          <NeuralBackground />

          {/* Application Page Routing */}
          <Routes>
            {/* Root lands straight on the redesigned Neural Control Center Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Unified Redesigned 9-Section Dashboard Workspace */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverviewPage />} />
              <Route path="upload" element={<Navigate to="/dashboard#section-upload" replace />} />
              <Route path="results" element={<Navigate to="/dashboard#section-results" replace />} />
              <Route path="neuro-care" element={<Navigate to="/dashboard#section-brain-compare" replace />} />
              <Route path="batch" element={<Navigate to="/dashboard#section-results" replace />} />
              <Route path="models" element={<Navigate to="/dashboard#section-models" replace />} />
              <Route path="signal-explorer" element={<Navigate to="/dashboard#section-scalp" replace />} />
              <Route path="history" element={<Navigate to="/dashboard#section-history" replace />} />
              <Route path="settings" element={<Navigate to="/dashboard#section-overview" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </IntroContext.Provider>
  );
}

export default App;
