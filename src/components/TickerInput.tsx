import React, { useState } from 'react';
import { Search, Play, RotateCcw, Sparkles, Building2, Tag } from 'lucide-react';

interface TickerInputProps {
  onAnalyze: (tickers: string[]) => void;
  isLoading: boolean;
  activeTickers: string[];
}

const PRESET_BASKETS = [
  {
    name: 'Mega-Cap Tech',
    tickers: ['AAPL', 'NVDA', 'MSFT', 'GOOGL'],
    badge: 'MKT CAP $12T+',
  },
  {
    name: 'AI Hardware & Semis',
    tickers: ['NVDA', 'TSM', 'AMD', 'AVGO'],
    badge: 'AI COMPUTE',
  },
  {
    name: 'Auto & Clean Tech',
    tickers: ['TSLA', 'RIVN', 'BYD', 'F'],
    badge: 'MOBILITY',
  },
  {
    name: 'Macro & Energy',
    tickers: ['XOM', 'CVX', 'COP', 'OXY'],
    badge: 'COMMODITIES',
  },
  {
    name: 'Wall St & Banking',
    tickers: ['JPM', 'GS', 'MS', 'BAC'],
    badge: 'FINANCIALS',
  },
];

export const TickerInput: React.FC<TickerInputProps> = ({
  onAnalyze,
  isLoading,
  activeTickers,
}) => {
  const [inputText, setInputText] = useState<string>('AAPL, NVDA, TSLA');

  const parseTickers = (raw: string): string[] => {
    return raw
      .split(/[\s,;\n]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0 && t.length <= 15);
  };

  const parsedList = Array.from(new Set(parseTickers(inputText)));

  const handleApplyPreset = (tickers: string[]) => {
    setInputText(tickers.join(', '));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (parsedList.length === 0 || isLoading) return;
    onAnalyze(parsedList);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[#10141e] border border-[#1e2638] rounded-lg p-4 sm:p-5 shadow-xl">
      {/* Top Presets bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-[#1c2436]">
        <div className="flex items-center gap-2 text-xs font-mono-terminal text-slate-300">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-amber-400">DESK PRESETS:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {PRESET_BASKETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset.tickers)}
              disabled={isLoading}
              className="text-left px-2.5 py-1 rounded bg-[#161c2a] hover:bg-[#20293d] border border-[#273248] text-slate-300 hover:text-white text-xs font-mono-terminal transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <span>{preset.name}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400/90 border border-amber-500/20">
                {preset.tickers.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-mono-terminal text-slate-400 mb-1.5">
            <label htmlFor="ticker-input" className="flex items-center gap-1.5 text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>PORTFOLIO WATCHLIST / TICKERS (COMMA OR SPACE SEPARATED)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {parsedList.length} entity/entities identified • Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Ctrl+Enter</kbd>
            </span>
          </div>

          <div className="relative">
            <textarea
              id="ticker-input"
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="e.g. AAPL, NVDA, TSLA, MSFT, GOOGL or company names like Amazon, Meta"
              className="w-full bg-[#090c12] border border-[#232c40] focus:border-amber-400/80 rounded p-3 text-sm text-slate-100 font-mono-terminal placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Parsed Tickers Preview Chips */}
        {parsedList.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] font-mono-terminal text-slate-400 mr-1">
              TARGET BASKET:
            </span>
            {parsedList.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#172030] border border-[#2b3952] text-xs font-mono-terminal font-semibold text-amber-300"
              >
                ${t}
              </span>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Fetches 3 verified real-time financial headlines per asset with Google Search grounding.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setInputText('')}
              disabled={isLoading || !inputText}
              className="px-3 py-2 rounded bg-[#151a26] hover:bg-[#1f2638] text-slate-400 hover:text-slate-200 text-xs font-mono-terminal transition-all flex items-center gap-1.5 border border-[#242e44] disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || parsedList.length === 0}
              className="flex-1 sm:flex-none px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-mono-terminal font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>RUNNING ANALYSIS...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ANALYZE NEWS & SENTIMENT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
