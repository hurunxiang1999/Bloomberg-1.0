import React from 'react';
import { TrendingUp, TrendingDown, Minus, Compass, BarChart3, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AnalysisResponse } from '../server/analyzeHandler';

interface SentimentSummaryBarProps {
  data: AnalysisResponse;
}

export const SentimentSummaryBar: React.FC<SentimentSummaryBarProps> = ({ data }) => {
  const { stats, portfolioSummary, netSentimentScore } = data;

  const isPositive = netSentimentScore > 10;
  const isNegative = netSentimentScore < -10;
  const stanceLabel = isPositive
    ? 'NET BULLISH BIAS'
    : isNegative
    ? 'NET BEARISH BIAS'
    : 'BALANCED / NEUTRAL BIAS';

  return (
    <div className="bg-[#10141e] border border-[#1e2638] rounded-lg p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Bar: Headline Metrics & Net Sentiment Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Net Sentiment Index */}
        <div className="bg-[#090c12] border border-[#1d2536] p-3.5 rounded-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono-terminal text-slate-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              NET SENTIMENT INDEX
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isPositive
                  ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-400'
                  : isNegative
                  ? 'bg-rose-950/70 border-rose-700/60 text-rose-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              {stanceLabel}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono-terminal ${
                isPositive
                  ? 'text-emerald-400'
                  : isNegative
                  ? 'text-rose-400'
                  : 'text-slate-200'
              }`}
            >
              {netSentimentScore > 0 ? `+${netSentimentScore}` : netSentimentScore}
            </span>
            <span className="text-xs font-mono-terminal text-slate-500">/ 100 max</span>
          </div>

          {/* Simple Meter */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${stats.bearishPct}%` }}
              title={`Bearish: ${stats.bearishPct}%`}
            ></div>
            <div
              className="h-full bg-slate-500 transition-all duration-500"
              style={{ width: `${stats.neutralPct}%` }}
              title={`Neutral: ${stats.neutralPct}%`}
            ></div>
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${stats.bullishPct}%` }}
              title={`Bullish: ${stats.bullishPct}%`}
            ></div>
          </div>
        </div>

        {/* Bullish Metric */}
        <div className="bg-[#090c12] border border-[#1d2536] p-3.5 rounded-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono-terminal text-emerald-400">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              BULLISH HEADLINES
            </span>
            <span className="text-[11px] font-mono-terminal text-slate-400">
              {stats.bullishPct}%
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-terminal text-emerald-400">
              {stats.bullish}
            </span>
            <span className="text-xs text-slate-500 font-mono-terminal">
              / {stats.totalHeadlines} articles
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Earnings beat, contract expansion & technological leadership
          </p>
        </div>

        {/* Bearish Metric */}
        <div className="bg-[#090c12] border border-[#1d2536] p-3.5 rounded-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono-terminal text-rose-400">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              BEARISH HEADLINES
            </span>
            <span className="text-[11px] font-mono-terminal text-slate-400">
              {stats.bearishPct}%
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-terminal text-rose-400">
              {stats.bearish}
            </span>
            <span className="text-xs text-slate-500 font-mono-terminal">
              / {stats.totalHeadlines} articles
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Margin compression, valuation friction & regulatory scrutiny
          </p>
        </div>

        {/* Neutral Metric */}
        <div className="bg-[#090c12] border border-[#1d2536] p-3.5 rounded-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono-terminal text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Minus className="w-3.5 h-3.5" />
              NEUTRAL HEADLINES
            </span>
            <span className="text-[11px] font-mono-terminal text-slate-400">
              {stats.neutralPct}%
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-terminal text-slate-200">
              {stats.neutral}
            </span>
            <span className="text-xs text-slate-500 font-mono-terminal">
              / {stats.totalHeadlines} articles
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Routine filings, executive governance & in-line guidance
          </p>
        </div>
      </div>

      {/* Strategic Portfolio Summary by Gemini */}
      <div className="bg-[#0b0e16] border border-[#222c42] p-3.5 rounded-md flex items-start gap-3">
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-bold font-mono-terminal uppercase tracking-wider text-amber-300">
              EXECUTIVE MACRO SYNTHESIS (GEMINI RISK DESK)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono-terminal">
              TIMESTAMP: {new Date(data.generatedAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {portfolioSummary}
          </p>
          {data.simulationNotice && (
            <div className="mt-2 text-[10px] text-amber-400/90 font-mono-terminal flex items-center gap-1.5 pt-2 border-t border-[#1f283d]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{data.simulationNotice}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
