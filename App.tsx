
import React, { useState, useEffect } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeNarrative } from './services/geminiService';
import VerdictStamp from './components/VerdictStamp';
import LiveScanner from './components/LiveScanner';

// Moved LensCard outside of the main App component to fix TypeScript "missing children" property errors
// and ensure proper type inference for JSX components by explicitly defining its props.
const LensCard: React.FC<{ 
  title: string; 
  status: 'PASS' | 'BREACHED'; 
  children: React.ReactNode 
}> = ({ title, status, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
    <div className={`px-6 py-4 flex items-center justify-between border-b ${status === 'PASS' ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
        status === 'PASS' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'
      }`}>
        {status === 'PASS' ? 'Secure' : 'Breached'}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showLive, setShowLive] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Audit...');

  useEffect(() => {
    let interval: number;
    if (state === AppState.ANALYZING) {
      const msgs = ['Atomizing Claims...', 'Scrubbing Metadata...', 'Cross-referencing Trails...', 'Calculating Logic Coherence...'];
      let i = 0;
      interval = window.setInterval(() => {
        setLoadingMessage(msgs[i % msgs.length]);
        i++;
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setState(AppState.ANALYZING);
    try {
      const res = await analyzeNarrative(input);
      setResult(res);
      setState(AppState.RESULT);
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Protocol interrupted.");
      setState(AppState.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans antialiased">
      {/* Sleek Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white text-xs">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <h1 className="font-bold text-xs tracking-[0.3em] uppercase text-slate-500">Detective Engine <span className="text-slate-300 font-normal">v4.2</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowLive(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
            Live Interface
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-6 md:p-10">
        {state !== AppState.RESULT ? (
          <div className="max-w-2xl mx-auto mt-24 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Input Intelligence</h2>
              <p className="text-slate-400 font-medium">Deploy the Tri-Lens Protocol for exhaustive narrative auditing.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste the statement or article here for forensic verification..."
                disabled={state === AppState.ANALYZING}
                className="w-full h-72 p-10 text-lg focus:outline-none placeholder-slate-200 leading-relaxed resize-none"
              />
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mono">Filter: Global Search Grounding</span>
                <button
                  onClick={handleAnalyze}
                  disabled={state === AppState.ANALYZING || !input.trim()}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-3 disabled:bg-slate-200"
                >
                  {state === AppState.ANALYZING ? (
                    <><i className="fa-solid fa-circle-notch animate-spin"></i> {loadingMessage}</>
                  ) : (
                    "Initialize Audit"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : result && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Executive Dossier Header */}
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Audit Report</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">{result.summary}</h2>
                <div className="flex gap-12 border-t border-slate-100 pt-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticity Score</p>
                    <p className={`text-4xl font-black ${result.score > 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.score}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Factual Claims</p>
                    <p className="text-4xl font-black text-slate-900">{result.lensB_Fact.claims.length}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-4">
                <VerdictStamp verdict={result.verdict} />
                <button onClick={() => {setState(AppState.IDLE); setInput('');}} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">New Dossier</button>
              </div>
            </div>

            {/* THE TRI-LENS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LENS A: SOURCE */}
              <LensCard title="Lens A: Source Identity" status={result.lensA_Source.status}>
                <div className="space-y-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Integrity Review</p>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{result.lensA_Source.overallRating}</p>
                  </div>
                  <div className="space-y-5">
                    {result.lensA_Source.entities.map((ent, i) => (
                      <div key={i} className="group pb-5 border-b border-slate-100 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-900">{ent.name}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                            ent.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>{ent.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed italic mb-3">"{ent.reason}"</p>
                        {ent.url && (
                          <a href={ent.url} target="_blank" className="text-[9px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                            <i className="fa-solid fa-link"></i> REGISTRY DATA
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </LensCard>

              {/* LENS B: FACT (The Core Scrollable) */}
              <LensCard title="Lens B: Fact Atomization" status={result.lensB_Fact.status}>
                <div className="space-y-6">
                  {result.lensB_Fact.claims.map((claim, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 ${
                          claim.verdict === 'refuted' ? 'border-rose-500 text-rose-500 bg-rose-50' : 
                          claim.verdict === 'verified' ? 'border-emerald-500 text-emerald-500 bg-emerald-50' : 
                          'border-slate-200 text-slate-400 bg-slate-50'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="w-px h-full bg-slate-100 mt-2 group-last:hidden"></div>
                      </div>
                      <div className="pb-8 space-y-3 flex-1">
                        <h4 className="text-sm font-bold text-slate-800 leading-snug">{claim.text}</h4>
                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                          {claim.evidence}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {claim.trail.map((t, ti) => (
                            <a key={ti} href={t.url} target="_blank" className="px-3 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 hover:text-blue-600 transition-all">
                              {t.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LensCard>

              {/* LENS C: LOGIC */}
              <LensCard title="Lens C: Logical Coherence" status={result.lensC_Logic.status}>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Tone Analysis</p>
                      <p className="text-xs font-bold text-slate-700">{result.lensC_Logic.emotionalTone}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Audit Score</p>
                      <p className="text-xs font-bold text-slate-700">{result.lensC_Logic.reasoningRating}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Anomalies Detected</p>
                    {result.lensC_Logic.fallacies.map((f, i) => (
                      <div key={i} className="p-5 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl">
                        <p className="text-[10px] font-black text-rose-700 uppercase mb-1">{f.name}</p>
                        <p className="text-[11px] text-rose-600/80 leading-normal">{f.explanation}</p>
                      </div>
                    ))}
                    {result.lensC_Logic.fallacies.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <i className="fa-solid fa-brain text-slate-200 text-2xl mb-3"></i>
                        <p className="text-[10px] font-bold text-slate-300 uppercase">Logic Pass</p>
                      </div>
                    )}
                  </div>
                </div>
              </LensCard>

            </div>
          </div>
        )}
      </main>

      {showLive && <LiveScanner onClose={() => setShowLive(false)} />}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
