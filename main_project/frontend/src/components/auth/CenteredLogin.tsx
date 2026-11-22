import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { saveSession } from '../../services/storage';

interface CenteredLoginProps {
  onSuccess: () => void;
}

export const CenteredLogin: React.FC<CenteredLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userName = email.trim() ? email.split('@')[0] : 'Research Clinician';
    saveSession({
      email: email.trim() || 'clinician@neuroscan.ai',
      name: userName,
      isGuest: false,
      role: 'Neuroscience Researcher',
      loginTime: new Date().toISOString(),
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 250);
  };

  const handleGuestLogin = () => {
    saveSession({
      email: 'guest.reviewer@neuroscan.ai',
      name: 'Guest Researcher',
      isGuest: true,
      role: 'Clinical AI Reviewer',
      loginTime: new Date().toISOString(),
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-[#020716] overflow-y-auto select-none">
      {/* Background Cyber Constellation Glow */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Ambient Radial Lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/15 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-blue-600/15 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Neural constellation nodes & connecting lines */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00d2ff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Subtle network lines */}
          <line x1="15%" y1="20%" x2="35%" y2="40%" stroke="#087CFF" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.4" />
          <line x1="35%" y1="40%" x2="50%" y2="25%" stroke="#00d2ff" strokeWidth="0.8" opacity="0.5" />
          <line x1="50%" y1="25%" x2="70%" y2="45%" stroke="#087CFF" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />
          <line x1="70%" y1="45%" x2="85%" y2="25%" stroke="#00d2ff" strokeWidth="0.8" opacity="0.4" />
          <line x1="20%" y1="75%" x2="40%" y2="60%" stroke="#00d2ff" strokeWidth="0.8" opacity="0.4" />
          <line x1="40%" y1="60%" x2="65%" y2="75%" stroke="#087CFF" strokeWidth="0.8" opacity="0.5" />
          <line x1="65%" y1="75%" x2="80%" y2="65%" stroke="#00d2ff" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.4" />

          {/* Constellation dots */}
          <circle cx="15%" cy="20%" r="3" fill="#00d2ff" filter="drop-shadow(0 0 6px #00d2ff)" />
          <circle cx="35%" cy="40%" r="3.5" fill="#79DFFF" filter="drop-shadow(0 0 8px #79DFFF)" />
          <circle cx="50%" cy="25%" r="2.5" fill="#00d2ff" />
          <circle cx="70%" cy="45%" r="4" fill="#00d2ff" filter="drop-shadow(0 0 10px #00d2ff)" />
          <circle cx="85%" cy="25%" r="3" fill="#79DFFF" />
          <circle cx="20%" cy="75%" r="3.5" fill="#00d2ff" filter="drop-shadow(0 0 8px #00d2ff)" />
          <circle cx="40%" cy="60%" r="2.5" fill="#79DFFF" />
          <circle cx="65%" cy="75%" r="3" fill="#00d2ff" />
          <circle cx="80%" cy="65%" r="3.5" fill="#00d2ff" filter="drop-shadow(0 0 8px #00d2ff)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center space-y-6">
        {/* Glowing Brain + ECG Pulse Logo */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative flex items-center justify-center">
            {/* Ambient halo behind icon */}
            <div className="absolute w-20 h-20 bg-[#00d2ff]/30 rounded-full filter blur-xl pointer-events-none animate-pulse" />

            <svg
              className="w-20 h-20 text-[#00d2ff] filter drop-shadow-[0_0_18px_rgba(0,210,255,0.7)]"
              viewBox="0 0 120 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Hemisphere */}
              <path
                d="M48 20 C36 20 28 26 26 34 C22 36 18 42 20 50 C18 56 22 66 28 68 C28 76 36 82 48 82 C49 82 50 82 51 81.5"
                stroke="#00d2ff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Hemisphere */}
              <path
                d="M58 20 C70 20 78 26 80 34 C84 36 88 42 86 50 C88 56 84 66 78 68 C78 76 70 82 58 82 C57 82 56 82 55 81.5"
                stroke="#00d2ff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Central Divider */}
              <path
                d="M53 22 L53 80"
                stroke="#00d2ff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1,3"
                opacity="0.8"
              />
              {/* Internal Gyri / Convolutions (Left) */}
              <path
                d="M32 36 C36 42 44 38 46 44 C42 48 34 48 36 56 C38 62 46 60 48 68"
                stroke="#00d2ff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Internal Gyri / Convolutions (Right) */}
              <path
                d="M74 36 C70 42 62 38 60 44 C64 48 72 48 70 56 C68 62 60 60 58 68"
                stroke="#00d2ff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Connected ECG Pulse Line emerging on Right */}
              <path
                d="M86 50 L91 50 L94 40 L97 64 L101 42 L105 54 L108 50 L116 50"
                stroke="#00d2ff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading Title */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_0_25px_rgba(0,210,255,0.45)]">
              NeuroScan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#38bdf8] to-[#087CFF]">AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans tracking-wide">
              Sign in to continue your journey with NeuroScan AI
            </p>
          </div>
        </div>

        {/* Centered Glowing Login Card */}
        <div className="w-full rounded-[30px] p-6 sm:p-8 bg-[#040e24]/85 border border-[#00d2ff]/60 shadow-[0_0_45px_rgba(0,210,255,0.25)] backdrop-blur-2xl space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#061533]/85 border border-slate-700/80 focus-within:border-[#00d2ff] focus-within:shadow-[0_0_15px_rgba(0,210,255,0.35)] transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
              />
            </div>

            {/* Password Field */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#061533]/85 border border-slate-700/80 focus-within:border-[#00d2ff] focus-within:shadow-[0_0_15px_rgba(0,210,255,0.35)] transition-all">
              <div className="w-8 h-8 rounded-xl bg-[#00d2ff]/15 border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff] shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-[#00d2ff] transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#061533] border border-slate-700 text-[#00d2ff] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00d2ff]"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset instructions have been dispatched to your email.')}
                className="text-[#00d2ff] hover:text-[#79DFFF] font-medium transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Main Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00d2ff] via-[#0099ff] to-[#087CFF] hover:from-[#38bdf8] hover:to-[#00d2ff] text-[#030914] font-heading font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,210,255,0.45)] hover:shadow-[0_0_35px_rgba(0,210,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-700/80 w-full" />
            <span className="bg-[#040e24] px-3 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-3 rounded-2xl bg-[#061533]/85 hover:bg-[#0a204d] border border-[#00d2ff]/40 hover:border-[#00d2ff] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff]">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>Continue as Guest</span>
          </button>

          {/* Footer inside card */}
          <div className="text-center text-xs text-slate-400 pt-2 font-sans">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-[#00d2ff] hover:text-[#79DFFF] font-bold underline transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
