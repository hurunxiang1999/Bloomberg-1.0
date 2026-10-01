import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { TickerInput } from './components/TickerInput';
import { SentimentSummaryBar } from './components/SentimentSummaryBar';
import { DataTable } from './components/DataTable';
import { ExportSheetsModal } from './components/ExportSheetsModal';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { AnalysisResponse, NewsItem } from './server/analyzeHandler';
import { AlertCircle, RefreshCw, BarChart2, ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const [activeTickers, setActiveTickers] = useState<string[]>(['AAPL', 'NVDA', 'TSLA']);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [sheetsExportedUrl, setSheetsExportedUrl] = useState<string | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        // User logged out or needs fresh token
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch initial analysis on mount
  useEffect(() => {
    handleRunAnalysis(['AAPL', 'NVDA', 'TSLA']);
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      if (
        !err?.message?.includes('popup-closed-by-user') &&
        !err?.code?.includes('popup-closed-by-user')
      ) {
        console.warn('Google Sign-In notice:', err?.message || err);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  const handleRunAnalysis = async (tickersToAnalyze: string[]) => {
    if (tickersToAnalyze.length === 0) return;

    setIsLoading(true);
    setError(null);
    setActiveTickers(tickersToAnalyze);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickers: tickersToAnalyze }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: Failed to analyze news & sentiment`);
      }

      const data: AnalysisResponse = await res.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to complete financial news and sentiment analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const allNewsItems: NewsItem[] = analysisData
    ? analysisData.results.flatMap((c) => c.news)
    : [];

  return (
    <div className="min-h-screen bg-[#090c12] text-[#e2e8f0] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Bloomberg-Style Global Header */}
      <Header
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSigningIn={isSigningIn}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Terminal Info Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-[#0f141f] border border-[#1b2333] rounded-md text-xs font-mono-terminal">
          <div className="flex items-center gap-2 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-400">DESK DIRECTIVE:</span>
            <span className="text-slate-400">
              Monitoring 3 latest financial headlines per ticker • Strict Bullish/Bearish/Neutral triaging • Direct Google Sheets export
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px] shrink-0">
            <span>MODEL: GEMINI 3.8 FLASH</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> SEARCH GROUNDING ON
            </span>
          </div>
        </div>

        {/* Input Area */}
        <TickerInput
          onAnalyze={handleRunAnalysis}
          isLoading={isLoading}
          activeTickers={activeTickers}
        />

        {/* Loading Indicator Overlay / Banner */}
        {isLoading && (
          <div className="p-8 rounded-lg bg-[#0e131d] border border-amber-500/30 flex flex-col items-center justify-center space-y-3 text-center shadow-2xl animate-pulse-subtle">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono-terminal text-amber-400 font-bold">
                AI
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono-terminal text-amber-300 uppercase tracking-wide">
                FETCHING LATEST FINANCIAL HEADLINES & QUANT SENTIMENT...
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Searching real-time news wires for {activeTickers.join(', ')} • Evaluating macro catalyst impact & strategic portfolio synthesis
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && !isLoading && (
          <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 flex items-start justify-between gap-3 text-rose-300 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="font-mono-terminal font-bold block mb-0.5">
                  ANALYSIS EXECUTION ERROR
                </strong>
                <span>{error}</span>
              </div>
            </div>
            <button
              onClick={() => handleRunAnalysis(activeTickers)}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 rounded text-rose-200 font-mono-terminal text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Results: Metrics Summary Bar */}
        {analysisData && !isLoading && (
          <SentimentSummaryBar data={analysisData} />
        )}

        {/* Results: Clean Bloomberg Data Table */}
        {analysisData && !isLoading && (
          <DataTable
            companies={analysisData.results}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            isExporting={false}
            sheetsExportedUrl={sheetsExportedUrl}
          />
        )}
      </main>

      {/* Google Sheets Export Modal */}
      <ExportSheetsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        items={allNewsItems}
        user={user}
        onAuthSuccess={(u, t) => {
          setUser(u);
          setToken(t);
        }}
      />

      {/* Terminal Footer */}
      <footer className="mt-auto border-t border-[#182030] bg-[#080a0f] py-3 text-[11px] font-mono-terminal text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">BLOOMBERG TERMINAL CLONE</span>
            <span>// PORTFOLIO SENTIMENT DESK</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>STRICT SENTIMENT: BULLISH • BEARISH • NEUTRAL</span>
            <span>•</span>
            <span>GOOGLE SHEETS API v4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
