import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowUpDown,
  Building,
} from 'lucide-react';
import { NewsItem, CompanyResult } from '../server/analyzeHandler';

interface DataTableProps {
  companies: CompanyResult[];
  onOpenExportModal: () => void;
  isExporting: boolean;
  sheetsExportedUrl?: string | null;
}

type SentimentFilter = 'ALL' | 'Bullish' | 'Bearish' | 'Neutral';
type SortField = 'ticker' | 'sentiment' | 'score' | 'headline';

export const DataTable: React.FC<DataTableProps> = ({
  companies,
  onOpenExportModal,
  isExporting,
  sheetsExportedUrl,
}) => {
  const [filterSentiment, setFilterSentiment] = useState<SentimentFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('ticker');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Flatten items for table display
  const allItems: NewsItem[] = useMemo(() => {
    return companies.flatMap((c) => c.news);
  }, [companies]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        if (filterSentiment !== 'ALL' && item.sentiment !== filterSentiment) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTicker = item.ticker.toLowerCase().includes(q);
          const matchCompany = item.companyName.toLowerCase().includes(q);
          const matchHeadline = item.headline.toLowerCase().includes(q);
          const matchSummary = item.strategicSummary.toLowerCase().includes(q);
          const matchImpact = item.macroImpact.toLowerCase().includes(q);
          return matchTicker || matchCompany || matchHeadline || matchSummary || matchImpact;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'ticker') {
          diff = a.ticker.localeCompare(b.ticker);
        } else if (sortField === 'sentiment') {
          diff = a.sentiment.localeCompare(b.sentiment);
        } else if (sortField === 'score') {
          diff = a.sentimentScore - b.sentimentScore;
        } else if (sortField === 'headline') {
          diff = a.headline.localeCompare(b.headline);
        }
        return sortAsc ? diff : -diff;
      });
  }, [allItems, filterSentiment, searchQuery, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    const headers = ['Ticker', 'Company', 'Headline', 'Sentiment', 'Score', 'Strategic Summary', 'Macro Driver', 'Source', 'Date'];
    const rows = filteredItems.map((i) => [
      `"${i.ticker}"`,
      `"${i.companyName}"`,
      `"${i.headline.replace(/"/g, '""')}"`,
      `"${i.sentiment}"`,
      i.sentimentScore,
      `"${i.strategicSummary.replace(/"/g, '""')}"`,
      `"${i.macroImpact}"`,
      `"${i.source}"`,
      `"${i.date}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Portfolio_News_Sentiment_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSentimentBadge = (sentiment: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sentiment) {
      case 'Bullish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-terminal font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            BULLISH
          </span>
        );
      case 'Bearish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-terminal font-bold bg-rose-950/80 border border-rose-700 text-rose-400">
            <TrendingDown className="w-3 h-3" />
            BEARISH
          </span>
        );
      case 'Neutral':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-terminal font-bold bg-slate-900 border border-slate-700 text-slate-300">
            <Minus className="w-3 h-3" />
            NEUTRAL
          </span>
        );
    }
  };

  return (
    <div className="bg-[#10141e] border border-[#1e2638] rounded-lg shadow-xl overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 bg-[#0d1017] border-b border-[#1c2436] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Filter Buttons & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded bg-[#161c2a] border border-[#232c40] p-0.5 text-xs font-mono-terminal">
            {(['ALL', 'Bullish', 'Bearish', 'Neutral'] as SentimentFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterSentiment(tab)}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-semibold ${
                  filterSentiment === tab
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
                {tab === 'ALL' && ` (${allItems.length})`}
                {tab === 'Bullish' && ` (${allItems.filter((i) => i.sentiment === 'Bullish').length})`}
                {tab === 'Bearish' && ` (${allItems.filter((i) => i.sentiment === 'Bearish').length})`}
                {tab === 'Neutral' && ` (${allItems.filter((i) => i.sentiment === 'Neutral').length})`}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline, driver, summary..."
              className="w-full pl-8 pr-3 py-1 bg-[#141926] border border-[#232d42] rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono-terminal"
            />
          </div>
        </div>

        {/* Right: Export Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {sheetsExportedUrl && (
            <a
              href={sheetsExportedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-emerald-950/70 border border-emerald-600/70 text-emerald-400 hover:bg-emerald-900/80 text-xs font-mono-terminal font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Latest Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={exportCSV}
            title="Download CSV"
            className="px-3 py-1.5 rounded bg-[#161c2b] hover:bg-[#20293d] border border-[#28344c] text-slate-300 hover:text-white text-xs font-mono-terminal font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={onOpenExportModal}
            disabled={isExporting || allItems.length === 0}
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-mono-terminal font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-900/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4 fill-current" />
            <span>EXPORT TO GOOGLE SHEETS</span>
          </button>
        </div>
      </div>

      {/* Structured Bloomberg Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0b0e14] border-b border-[#20293d] text-slate-400 font-mono-terminal text-[11px] uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort('ticker')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 w-28"
              >
                <div className="flex items-center gap-1">
                  <span>TICKER</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sentiment')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 w-32"
              >
                <div className="flex items-center gap-1">
                  <span>SENTIMENT</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>
              <th
                onClick={() => handleSort('headline')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-amber-400 min-w-[280px]"
              >
                <div className="flex items-center gap-1">
                  <span>HEADLINE (3 LATEST PER ASSET)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-600" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold min-w-[320px]">
                <span>1-SENTENCE STRATEGIC SUMMARY</span>
              </th>
              <th className="py-2.5 px-3 font-semibold w-36">
                <span>MACRO DRIVER</span>
              </th>
              <th className="py-2.5 px-3 font-semibold w-36 text-right">
                <span>SOURCE / TIME</span>
              </th>
              <th className="py-2.5 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#182030] font-mono-terminal">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-mono-terminal">
                  No headlines match the selected sentiment or search criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isExpanded = expandedRowId === item.id;
                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                      className={`hover:bg-[#141a27] cursor-pointer transition-colors group ${
                        isExpanded ? 'bg-[#151c2b]' : ''
                      }`}
                    >
                      {/* Ticker */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="font-bold text-amber-300 text-sm group-hover:text-amber-200">
                          ${item.ticker}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[100px]" title={item.companyName}>
                          {item.companyName}
                        </div>
                      </td>

                      {/* Sentiment */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        {getSentimentBadge(item.sentiment)}
                        <div className="text-[10px] text-slate-500 mt-1">
                          Score: {item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore}
                        </div>
                      </td>

                      {/* Headline */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-sans font-medium text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-100">
                          {item.headline}
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:underline mt-1"
                          >
                            <span>Read full report</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      {/* 1-Sentence Strategic Summary */}
                      <td className="py-3 px-3 align-top">
                        <div className="text-slate-300 font-sans text-xs leading-relaxed bg-[#0b0e14]/60 p-2 rounded border border-[#1e273a]">
                          {item.strategicSummary}
                        </div>
                      </td>

                      {/* Macro Driver */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#182133] border border-[#27354f] text-[11px] text-slate-300 font-medium">
                          {item.macroImpact}
                        </span>
                      </td>

                      {/* Source & Date */}
                      <td className="py-3 px-3 align-top whitespace-nowrap text-right">
                        <div className="text-slate-300 font-semibold text-[11px]">
                          {item.source}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.date}
                        </div>
                      </td>

                      {/* Expand Toggle */}
                      <td className="py-3 px-2 align-top text-center text-slate-500">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-[#0e131d] border-b border-[#212c40]">
                        <td colSpan={7} className="p-4 pl-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-terminal">
                            <div className="p-3 bg-[#080b10] border border-[#1a2333] rounded">
                              <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">
                                ASSET & VALUATION CONTEXT
                              </span>
                              <p className="text-slate-300 font-sans text-xs">
                                Asset: <strong className="text-white">${item.ticker}</strong> ({item.companyName})
                              </p>
                              <p className="text-slate-400 font-sans text-xs mt-1">
                                Sentiment Conviction: <span className="text-white font-mono-terminal">{Math.abs(item.sentimentScore * 100)}%</span>
                              </p>
                            </div>

                            <div className="p-3 bg-[#080b10] border border-[#1a2333] rounded md:col-span-2">
                              <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">
                                PORTFOLIO MANAGER STRATEGIC IMPLICATION
                              </span>
                              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                                {item.strategicSummary}
                              </p>
                              <div className="mt-2 pt-2 border-t border-[#1a2333] flex items-center justify-between text-[11px] text-slate-400">
                                <span>Driver: <strong className="text-slate-300">{item.macroImpact}</strong></span>
                                <span>Reported by: <strong className="text-slate-300">{item.source}</strong> ({item.date})</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-3 bg-[#0a0d14] border-t border-[#1a2233] text-[11px] font-mono-terminal text-slate-400 flex items-center justify-between">
        <span>
          Showing {filteredItems.length} of {allItems.length} news items across {companies.length} assets
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Click any row to expand strategic PM notes
        </span>
      </div>
    </div>
  );
};
