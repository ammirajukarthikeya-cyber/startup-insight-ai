'use client';

import React, { useState } from 'react';
import { api } from '../../utils/api';
import { IdeaAnalysis, Competitor, VulnerabilityCategory } from '../../types';
import RadarChart from '../../components/RadarChart';
import Toast from '../../components/Toast';

export default function AnalyzerPage() {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [market, setMarket] = useState('');
  const [pitch, setPitch] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Competitors filter & search state
  const [compSearch, setCompSearch] = useState('');
  const [compFilter, setCompFilter] = useState<'all' | 'direct' | 'indirect'>('all');
  
  // Vulnerability active tab state
  const [activeRiskTab, setActiveRiskTab] = useState<string>('business');

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !market || !pitch.trim()) {
      setToastType('error');
      setToastMessage('Please fill in all target parameters.');
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await api.post<IdeaAnalysis>('/api/analyzer/run', {
        name: name || 'Concept Screen',
        industry,
        target_market: market,
        pitch_text: pitch
      });
      setAnalysis(res);
      setToastType('success');
      setToastMessage('Startup feasibility analysis completed successfully.');
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Analysis failed. Double check your subscription tier limits.');
    } finally {
      setLoading(false);
    }
  };

  const swot = analysis ? JSON.parse(analysis.swot_json) as { strengths: string[], weaknesses: string[] } : null;
  const competitors = analysis ? JSON.parse(analysis.competitors_json) as Competitor[] : [];
  const vulnerabilities = analysis ? JSON.parse(analysis.vulnerabilities_json) as Record<string, VulnerabilityCategory> : null;

  // Filtered competitor lists
  const filteredComps = competitors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(compSearch.toLowerCase()) || 
                          c.pitch.toLowerCase().includes(compSearch.toLowerCase());
    const matchesFilter = compFilter === 'all' || c.type === compFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-12">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Startup Idea <span className="text-gradient-cyan">Analyzer Console</span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          Outline your business premise and target audience. Our advanced AI modeling engine evaluates feasibility, SWOT, risk categories, and direct competitor lists instantly.
        </p>
      </div>

      {/* Grid: Left inputs parameters, Right outputs radar metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Inputs panel */}
        <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            Startup Input Parameters
          </h3>

          <form onSubmit={handleRunScan} className="space-y-5">
            <div>
              <label htmlFor="startupName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Startup Name (Optional)</label>
              <input 
                id="startupName"
                type="text" 
                placeholder="e.g. EcoSphere Logistics" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Industry</label>
                <select 
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-400"
                >
                  <option value="">Select Industry</option>
                  <option value="saas">SaaS & Software</option>
                  <option value="fintech">Fintech & Web3</option>
                  <option value="healthtech">Healthtech & Biotech</option>
                  <option value="cleantech">Cleantech & Energy</option>
                  <option value="ecommerce">E-Commerce & Retail</option>
                  <option value="ai">AI & Robotics</option>
                </select>
              </div>

              <div>
                <label htmlFor="market" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Market / region</label>
                <input 
                  id="market"
                  type="text" 
                  placeholder="e.g. APAC developers" 
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pitch" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Explain Startup Idea</label>
              <textarea 
                id="pitch"
                rows={5}
                placeholder="Describe the target customer problem, your proposed solution, pricing assumptions, and expansion plans..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-200 leading-relaxed"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running AI Feasibility Scans...
                </>
              ) : (
                'Run AI Validation Scans'
              )}
            </button>
          </form>
        </div>

        {/* Right Radar metrics and SWOT */}
        <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md min-h-[468px] flex flex-col justify-center">
          {!analysis ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-300">Awaiting Startup Parameters</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Submit your startup pitch in the console to calculate feasibility coordinates, SWOT, and mitigations.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                <RadarChart 
                  feasibility={analysis.feasibility_score}
                  market={analysis.market_score}
                  risk={analysis.risk_score}
                  funding={analysis.funding_score}
                  health={analysis.health_score}
                />
                
                <div className="flex-1 flex flex-col gap-3 w-full">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Startup Health Score</span>
                    <span className="text-emerald-400 font-bold">{analysis.health_score} / 100</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${analysis.health_score}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Vulnerability Risk Index</span>
                    <span className="text-rose-400 font-bold">{analysis.risk_score}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full transition-all duration-700" style={{ width: `${analysis.risk_score}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Funding Readiness Index</span>
                    <span className="text-purple-400 font-bold">{analysis.funding_score}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-700" style={{ width: `${analysis.funding_score}%` }} />
                  </div>
                </div>
              </div>

              {/* SWOT Grid */}
              {swot && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</h4>
                    <ul className="space-y-1.5 text-xxs text-slate-300">
                      {swot.strengths.map((s, i) => <li key={i} className="list-disc ml-3 leading-relaxed">{s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 rounded-xl border border-rose-500/10 p-4">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Weaknesses</h4>
                    <ul className="space-y-1.5 text-xxs text-slate-300">
                      {swot.weaknesses.map((w, i) => <li key={i} className="list-disc ml-3 leading-relaxed">{w}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Additional blocks shown only after scan completes */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in slide-in-from-bottom-6 duration-300">
          
          {/* Competitor Discovery column */}
          <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ecosystem Competitors</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCompFilter('all')}
                  className={`text-xxs px-2.5 py-1 rounded-full border transition ${compFilter === 'all' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-white/5 text-slate-400'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setCompFilter('direct')}
                  className={`text-xxs px-2.5 py-1 rounded-full border transition ${compFilter === 'direct' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-white/5 text-slate-400'}`}
                >
                  Direct
                </button>
                <button 
                  onClick={() => setCompFilter('indirect')}
                  className={`text-xxs px-2.5 py-1 rounded-full border transition ${compFilter === 'indirect' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' : 'border-white/5 text-slate-400'}`}
                >
                  Indirect
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <input 
              type="text"
              placeholder="Search competitor names or features..."
              value={compSearch}
              onChange={(e) => setCompSearch(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-slate-950 px-3 py-2 text-xs text-slate-300 mb-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {filteredComps.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/40 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{c.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${c.type === 'direct' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {c.type}
                    </span>
                  </div>
                  <p className="text-xxs text-slate-400 leading-relaxed">{c.pitch}</p>
                  <div className="border-t border-white/5 pt-2 mt-1 text-[10px] space-y-1">
                    <p className="text-emerald-400"><strong>Strength:</strong> {c.strengths}</p>
                    <p className="text-rose-400"><strong>Weakness:</strong> {c.weaknesses}</p>
                    <p className="text-slate-300"><strong>Disrupt Strategy:</strong> {c.strategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerability scan tab lists */}
          {vulnerabilities && (
            <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Risk Scanner</h3>
              
              {/* Tab Selector lists */}
              <div className="space-y-3">
                {Object.keys(vulnerabilities).map((key) => {
                  const item = vulnerabilities[key];
                  const isActive = activeRiskTab === key;
                  return (
                    <div 
                      key={key}
                      onClick={() => setActiveRiskTab(key)}
                      className={`rounded-xl border p-3.5 cursor-pointer transition ${isActive ? 'border-rose-500 bg-rose-500/5' : 'border-white/5 bg-slate-950/20 hover:border-white/10'}`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-200">{item.title}</span>
                        <span className={`text-[10px] font-bold ${item.level === 'High' ? 'text-rose-400' : 'text-orange-400'}`}>{item.level}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${item.level === 'High' ? 'bg-rose-500' : 'bg-orange-500'}`} style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Display details of active tab */}
              <div className="mt-6 border-t border-white/5 pt-4 text-xs">
                <h4 className="font-bold text-rose-400">{vulnerabilities[activeRiskTab].title} Blueprint:</h4>
                <p className="text-slate-400 mt-2 leading-relaxed text-xxs">{vulnerabilities[activeRiskTab].desc}</p>
                <ul className="mt-3 space-y-1.5">
                  {vulnerabilities[activeRiskTab].bullets.map((b, i) => (
                    <li key={i} className="text-xxs text-slate-300 leading-relaxed flex items-start gap-1.5">
                      <span className="text-rose-500 shrink-0">▪</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
