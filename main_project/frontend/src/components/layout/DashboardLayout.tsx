import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useIntro } from '../../App';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle }) => {
  const { introPhase } = useIntro();

  return (
    <div className="min-h-screen bg-transparent text-[#F3F8FF] flex flex-col font-sans relative z-10">
      {/* Sticky Top Header Bar matching NEUROSCAN AI layout - hidden during full-screen intro */}
      <div
        className={`transition-opacity duration-1000 ${
          introPhase === 'intro' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Header title={title} subtitle={subtitle} />
      </div>

      {/* Main Content Area - Full width with balanced padding */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-12">
        <Outlet />
      </main>

      {/* Footer - hidden during full-screen intro */}
      <div
        className={`transition-opacity duration-1000 ${
          introPhase === 'intro' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
