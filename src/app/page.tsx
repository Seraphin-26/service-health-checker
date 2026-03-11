'use client';

import { useState, useRef } from 'react';

type Status = 'idle' | 'checking' | 'online' | 'offline' | 'error';

interface CheckResult {
  url: string;
  status: Status;
  statusCode?: number;
  latency?: number;
  message?: string;
  checkedAt?: string;
}

const EXAMPLE_URLS = [
  'https://google.com',
  'https://github.com',
  'https://httpstat.us/200',
  'https://httpstat.us/503',
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [history, setHistory] = useState<CheckResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkService = async (targetUrl?: string) => {
    const checkUrl = targetUrl ?? url;
    if (!checkUrl.trim()) return;

    setResult({ url: checkUrl, status: 'checking' });

    const start = Date.now();
    try {
      const res = await fetch(`/api/check?url=${encodeURIComponent(checkUrl)}`);
      const data = await res.json();
      const latency = Date.now() - start;

      const newResult: CheckResult = {
        url: checkUrl,
        status: data.online ? 'online' : 'offline',
        statusCode: data.statusCode,
        latency,
        message: data.message,
        checkedAt: new Date().toLocaleTimeString('fr-FR'),
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 6));
    } catch {
      const newResult: CheckResult = {
        url: checkUrl,
        status: 'error',
        message: 'Impossible de contacter le vérificateur',
        checkedAt: new Date().toLocaleTimeString('fr-FR'),
      };
      setResult(newResult);
      setHistory(prev => [newResult, ...prev].slice(0, 6));
    }
  };

  const handleExampleClick = (exUrl: string) => {
    setUrl(exUrl);
    checkService(exUrl);
  };

  const statusConfig = {
    idle:     { label: '',              color: '',                  bg: '',                                      dot: '' },
    checking: { label: 'Vérification…', color: 'text-amber-300',   bg: 'bg-amber-400/10 border-amber-400/30',   dot: 'bg-amber-400 animate-pulse' },
    online:   { label: 'EN LIGNE',      color: 'text-emerald-300', bg: 'bg-emerald-400/10 border-emerald-400/30', dot: 'bg-emerald-400' },
    offline:  { label: 'HORS LIGNE',    color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30',       dot: 'bg-red-400' },
    error:    { label: 'ERREUR',        color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/30', dot: 'bg-orange-400' },
  };

  const cfg = result ? statusConfig[result.status] : null;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-mono overflow-x-hidden relative">

      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-emerald-500/5 blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full bg-cyan-500/5 blur-[100px] sm:blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-xs text-emerald-400/60 tracking-[0.2em] sm:tracking-[0.3em] uppercase">
              Système opérationnel
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-none mb-3">
            <span className="text-white">Service</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Health Checker
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm tracking-wide leading-relaxed">
            Diagnostiquez la disponibilité de n'importe quel service en temps réel.
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4 sm:p-6 mb-5 sm:mb-6">
          <label className="block text-xs text-slate-500 tracking-[0.2em] uppercase mb-3">
            URL cible
          </label>

          {/* Stack vertical on mobile, horizontal on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm select-none">›</span>
              <input
                ref={inputRef}
                type="url"
                inputMode="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkService()}
                placeholder="https://votre-service.com"
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-8 pr-4 py-3.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => checkService()}
              disabled={result?.status === 'checking'}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm tracking-wide transition-all duration-150"
            >
              {result?.status === 'checking' ? '...' : 'TESTER'}
            </button>
          </div>

          {/* Scrollable examples row on mobile */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-700 whitespace-nowrap flex-shrink-0">Exemples :</span>
            {EXAMPLE_URLS.map(ex => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-500 hover:text-slate-300 transition-all"
              >
                {ex.replace('https://', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Result card */}
        {result && cfg && result.status !== 'idle' && (
          <div className={`rounded-2xl border ${cfg.bg} p-4 sm:p-6 mb-5 sm:mb-6 transition-all duration-300`}>
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className={`text-lg sm:text-xl font-bold tracking-widest ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              {result.checkedAt && (
                <span className="text-xs text-slate-600 flex-shrink-0">{result.checkedAt}</span>
              )}
            </div>

            {/* URL breaks on small screens instead of overflow */}
            <div className="text-xs sm:text-sm text-slate-500 mb-4 break-all">
              {result.url}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {result.statusCode !== undefined && (
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-xs text-slate-600 mb-1 uppercase tracking-wider">Code HTTP</div>
                  <div className={`text-2xl font-bold ${cfg.color}`}>{result.statusCode}</div>
                </div>
              )}
              {result.latency !== undefined && (
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-xs text-slate-600 mb-1 uppercase tracking-wider">Latence</div>
                  <div className="text-2xl font-bold text-slate-300">
                    {result.latency}
                    <span className="text-sm font-normal text-slate-600 ml-1">ms</span>
                  </div>
                </div>
              )}
            </div>

            {result.message && (
              <div className="mt-3 text-xs text-slate-600 bg-black/20 rounded-lg px-3 py-2 break-words">
                {result.message}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
            <h2 className="text-xs text-slate-600 tracking-[0.25em] uppercase mb-3 sm:mb-4">
              Historique
            </h2>
            <div className="space-y-1">
              {history.map((h, i) => {
                const hCfg = statusConfig[h.status];
                return (
                  <div
                    key={i}
                    onClick={() => setUrl(h.url)}
                    className="flex items-center gap-2 sm:gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.04] active:bg-white/[0.06] cursor-pointer transition-all group"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hCfg.dot}`} />
                    <span className="text-xs sm:text-sm text-slate-400 flex-1 truncate min-w-0 group-hover:text-slate-200 transition-colors">
                      {h.url}
                    </span>
                    <span className={`text-xs font-bold tracking-wider ${hCfg.color} opacity-70 flex-shrink-0 hidden sm:inline`}>
                      {hCfg.label}
                    </span>
                    {h.latency && (
                      <span className="text-xs text-slate-700 flex-shrink-0">{h.latency}ms</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-center text-slate-800 text-xs mt-8 sm:mt-10 tracking-wider">
          SERVICE HEALTH CHECKER · NEXT.JS 14 · APP ROUTER
        </p>
      </div>
    </main>
  );
}
