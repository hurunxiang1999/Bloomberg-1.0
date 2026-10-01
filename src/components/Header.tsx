import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, LogOut, Terminal, Clock, ExternalLink } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignIn,
  onSignOut,
  isSigningIn,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [estTimeStr, setEstTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC'
      );
      setEstTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' EST'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#1e2638] bg-[#0c0f17] select-none">
      {/* Top Macro Ticker Tape */}
      <div className="border-b border-[#182030] bg-[#080b10] px-3 py-1 text-[11px] font-mono-terminal flex flex-wrap items-center justify-between gap-4 text-slate-400">
        <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap py-0.5">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYS: LIVE FEED
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">SPX</span>
            <span className="text-slate-400">5,892.40</span>
            <span className="text-emerald-400">+0.48%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">NDX</span>
            <span className="text-slate-400">18,540.25</span>
            <span className="text-emerald-400">+0.72%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">US10Y</span>
            <span className="text-slate-400">4.112%</span>
            <span className="text-emerald-400">-2.6bps</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">DXY</span>
            <span className="text-slate-400">101.32</span>
            <span className="text-rose-400">-0.21%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">VIX</span>
            <span className="text-slate-400">14.65</span>
            <span className="text-emerald-400">-3.40%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-slate-300 font-bold">WTI</span>
            <span className="text-slate-400">$73.20</span>
            <span className="text-emerald-400">+0.85%</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{timeStr}</span>
            <span className="text-slate-500">/</span>
            <span>{estTimeStr}</span>
          </span>
          <span className="bg-emerald-950/70 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-800/60 uppercase">
            MARKET OPEN
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-mono-terminal">
                MACRO SENTIMENT INTELLIGENCE
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono-terminal font-semibold">
                DESK v3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-Time Financial Press Grounding • Strict Sentiment Triaging • Google Sheets Export
            </p>
          </div>
        </div>

        {/* Right side: Auth & Workspace Connection */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-[#121824] border border-[#222e44] rounded p-1.5 pl-3">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-slate-600"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 text-xs flex items-center justify-center font-bold">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono-terminal">
                    <ShieldCheck className="w-3 h-3" /> Sheets Ready
                  </div>
                </div>
              </div>
              <button
                onClick={onSignOut}
                title="Disconnect Google Account"
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              disabled={isSigningIn}
              className="gsi-material-button inline-flex items-center gap-2.5 px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium shadow-sm transition-all border border-slate-300 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <div className="w-4 h-4 shrink-0">
                <svg viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="font-semibold text-slate-800">
                {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
