import React, { useEffect, useState } from 'react';
import { RefreshCw, UploadCloud, Activity, LogOut } from 'lucide-react';
import { getHealth } from '../../services/api';
import { HealthResponse } from '../../types';
import { useIntro } from '../../App';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const { logout } = useIntro();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('section-overview');

  const checkConnection = () => {
    if (isLoading) return;
    setIsLoading(true);
    const start = Date.now();
    getHealth()
      .then((data) => {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 1200 - elapsed);
        setTimeout(() => {
          setHealth(data);
          setIsLoading(false);
        }, delay);
      })
      .catch(() => {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 1200 - elapsed);
        setTimeout(() => {
          setHealth(null);
          setIsLoading(false);
        }, delay);
      });
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = `#${id}`;
    }
  };

  const navItems = [
    { label: "Overview", id: "section-overview" },
    { label: "Analysis", id: "section-upload" },
    { label: "Results", id: "section-results" },
    { label: "Models", id: "section-models" },
    { label: "Scalp Map", id: "section-scalp" },
    { label: "Comparison", id: "section-brain-compare" },
    { label: "History", id: "section-history" },
  ];

  return (
    <header className="h-20 px-6 md:px-10 border-b border-[#20BFE8]/20 bg-[#030914]/90 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* Brand Logo - NEUROSCAN AI Only */}
      <div 
        onClick={() => scrollTo('section-overview')}
        className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
      >
        <div className="relative flex items-center">
          <span className="text-xl md:text-2xl font-black font-heading text-white tracking-wider group-hover:text-[#20BFE8] transition-colors">
            NEUROSCAN <span className="text-[#20BFE8]">AI</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-[#20BFE8] ml-2 shadow-[0_0_10px_#20BFE8] animate-pulse" />
        </div>
      </div>

      {/* Center Nav Links - Clean Horizontal Bar */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeSection === item.id
                ? 'text-[#20BFE8] bg-[#087CFF]/15 border border-[#20BFE8]/40 shadow-[0_0_12px_rgba(32,191,232,0.2)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right Controls - Telemetry Badge & Pill Button matching BrainPremium */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Backend Status Pill with Real Retry */}
        <button
          type="button"
          onClick={checkConnection}
          disabled={isLoading}
          className="cursor-pointer group hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#061426]/90 border border-[#20BFE8]/30 hover:border-[#20BFE8]/70 hover:bg-[#087CFF]/10 transition-all text-xs font-mono select-none shadow-[0_0_15px_rgba(32,191,232,0.15)] disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-95"
          title="Click to check backend health status"
        >
          {isLoading ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-bold font-mono">Checking...</span>
            </>
          ) : health ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-emerald-400 font-bold font-mono tracking-wide">FastAPI Online</span>
              <span className="text-[10px] text-slate-400 font-bold hidden xl:inline">
                ({health.device})
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-400 font-bold font-mono">Backend Offline</span>
            </>
          )}

          <RefreshCw
            className={`w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors ${
              isLoading ? 'animate-spin text-cyan-400' : ''
            }`}
          />
        </button>

        {/* Primary Pill Button - Matching "Open the terminal" */}
        <button
          onClick={() => scrollTo('section-upload')}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#20BFE8] hover:bg-[#79DFFF] text-[#030914] text-xs font-heading font-extrabold tracking-wide uppercase shadow-[0_0_15px_rgba(32,191,232,0.35)] hover:shadow-[0_0_20px_rgba(32,191,232,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Analysis</span>
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign out of NeuroScan AI session"
          className="cursor-pointer group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#061426]/90 border border-slate-700/80 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-mono transition-all shadow-sm active:scale-95 select-none"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
          <span className="hidden sm:inline text-[11px] font-semibold">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
