import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Database,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { NewsItem } from '../server/analyzeHandler';
import { exportToGoogleSheets, ExportResult } from '../services/sheetsExport';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';

interface ExportSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: NewsItem[];
  user: User | null;
  onAuthSuccess: (user: User, token: string) => void;
}

export const ExportSheetsModal: React.FC<ExportSheetsModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onAuthSuccess,
}) => {
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    const d = new Date().toISOString().substring(0, 10);
    return `Portfolio News & Sentiment Tracker - ${d}`;
  });
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage('');
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
      }
    } catch (err: any) {
      if (!err?.message?.includes('popup-closed-by-user')) {
        setErrorMessage(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleExecuteExport = async () => {
    setStatus('exporting');
    setProgressMsg('Verifying Google Workspace access authorization...');
    setErrorMessage('');

    try {
      let token = await getAccessToken();
      if (!token) {
        setProgressMsg('Requesting Google Workspace authorization...');
        const authRes = await googleSignIn();
        if (!authRes?.accessToken) {
          setStatus('idle');
          return;
        }
        token = authRes.accessToken;
        onAuthSuccess(authRes.user, token);
      }

      setProgressMsg('Creating Google Spreadsheet in your Google Drive...');
      const result = await exportToGoogleSheets(token, items, spreadsheetTitle.trim());

      setExportResult(result);
      setStatus('success');
    } catch (err: any) {
      console.error('Export Error:', err);
      setStatus('error');
      setErrorMessage(
        err.message || 'An unexpected error occurred while communicating with Google Sheets.'
      );
    }
  };

  const handleCopyLink = () => {
    if (exportResult?.spreadsheetUrl) {
      navigator.clipboard.writeText(exportResult.spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f141f] border border-[#222d42] rounded-lg max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1f283d] flex items-center justify-between bg-[#0b0e16]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono-terminal text-white">
                EXPORT TO GOOGLE SHEETS
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct export to Google Drive for portfolio managers and risk committee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {status === 'success' && exportResult ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-md bg-emerald-950/40 border border-emerald-700/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-emerald-300 font-mono-terminal text-sm mb-1">
                    SPREADSHEET CREATED SUCCESSFULLY!
                  </h4>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    Exported <strong className="text-emerald-300 font-mono-terminal">{exportResult.rowsExported} news headlines & sentiment ratings</strong> with customized Bloomberg header styling into your Google Drive.
                  </p>
                </div>
              </div>

              <div className="bg-[#090c12] border border-[#1e2638] p-3 rounded text-xs font-mono-terminal space-y-2">
                <div className="text-slate-400 text-[11px]">SPREADSHEET DESTINATION:</div>
                <div className="text-amber-300 font-semibold truncate">
                  {exportResult.title}
                </div>
                <div className="text-slate-500 text-[10px] break-all">
                  ID: {exportResult.spreadsheetId}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <a
                  href={exportResult.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono-terminal font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950"
                >
                  <span>OPEN IN GOOGLE SHEETS</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto py-2.5 px-3 rounded bg-[#171e2c] hover:bg-[#20293b] border border-[#2b374e] text-slate-300 hover:text-white font-mono-terminal text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY LINK</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Workspace Action Confirmation Notice */}
              <div className="p-3.5 rounded bg-[#131926] border border-[#202b3d] text-xs font-sans text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono-terminal text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>WORKSPACE INTEGRATION CONFIRMATION</span>
                </div>
                <p className="leading-relaxed text-slate-300 text-[11px]">
                  This operation will create a new Google Spreadsheet titled below in your Google Drive, populated with structured columns:
                  <strong className="text-slate-200"> Ticker, Headline, Sentiment (Bullish/Bearish/Neutral), 1-Sentence Strategic Summary, Macro Impact, Source, and Date</strong>.
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono-terminal text-slate-400 pt-1 border-t border-[#1e273a]">
                  <span>Items: <strong className="text-amber-300">{items.length}</strong></span>
                  <span>Connected Account: <strong className="text-slate-200">{user?.email || 'Not connected'}</strong></span>
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono-terminal text-slate-300 block">
                  SPREADSHEET TITLE
                </label>
                <input
                  type="text"
                  value={spreadsheetTitle}
                  onChange={(e) => setSpreadsheetTitle(e.target.value)}
                  disabled={status === 'exporting'}
                  className="w-full px-3 py-2 bg-[#090c12] border border-[#232c40] rounded text-xs text-slate-100 font-mono-terminal focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Sign in required warning if user not connected */}
              {!user && (
                <div className="p-3 rounded bg-amber-950/30 border border-amber-800/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Google authentication required to create sheets in Drive.</span>
                  </div>
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="px-3 py-1.5 rounded bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                  >
                    {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                  </button>
                </div>
              )}

              {/* Error message */}
              {status === 'error' && (
                <div className="p-3 rounded bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold font-mono-terminal block">EXPORT FAILED</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Progress message */}
              {status === 'exporting' && (
                <div className="p-3 rounded bg-[#131926] border border-[#232d40] flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-mono-terminal text-emerald-300">
                    {progressMsg}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {status !== 'success' && (
          <div className="px-5 py-3 border-t border-[#1e273a] bg-[#0b0e14] flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              disabled={status === 'exporting'}
              className="px-3.5 py-1.5 rounded bg-[#151b27] hover:bg-[#1d2536] text-slate-300 text-xs font-mono-terminal transition-all border border-[#242f44]"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteExport}
              disabled={status === 'exporting' || items.length === 0}
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-mono-terminal font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950 disabled:opacity-50 cursor-pointer"
            >
              {status === 'exporting' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>CREATING SPREADSHEET...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CONFIRM & EXPORT TO GOOGLE SHEETS</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
