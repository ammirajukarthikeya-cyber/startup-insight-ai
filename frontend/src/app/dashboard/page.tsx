'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { IdeaAnalysis, AuditLog } from '../../types';
import Toast from '../../components/Toast';
import Link from 'next/link';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [analyses, setAnalyses] = useState<IdeaAnalysis[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedAnalysis, setSelectedAnalysis] = useState<IdeaAnalysis | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [analysesData, logsData, sessionsData] = await Promise.all([
        api.get<IdeaAnalysis[]>('/api/user/analyses'),
        api.get<AuditLog[]>('/api/user/audit-logs'),
        api.get<any[]>('/api/user/active-sessions')
      ]);
      setAnalyses(analysesData);
      setAuditLogs(logsData);
      setSessions(sessionsData);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      // Defer loading check to layout context check
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    } else {
      fetchDashboardData();
    }
  }, [user]);

  const handleTerminateSession = async (sessId: number) => {
    try {
      await api.post(`/api/user/terminate-session/${sessId}`);
      setToastType('success');
      setToastMessage('Session successfully terminated');
      fetchDashboardData();
    } catch (err: any) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to terminate session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="animate-spin h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-8">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}

      {/* Profile summary banner */}
      <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white">Console Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Manage validated startup blueprints and check session audits.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/analyzer"
            className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-bold transition"
          >
            + Run New Scan
          </Link>
          <Link 
            href="/pricing"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 text-xs font-bold transition border border-white/5"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>

      {/* Grid: Left lists analyses, Right displays details and logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Saved Analyses lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Saved Idea Analyses</h3>
            
            {analyses.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/20 rounded-xl border border-dashed border-white/5">
                <p className="text-xs text-slate-500">No startup analyses saved yet.</p>
                <Link href="/analyzer" className="text-xs text-cyan-400 hover:underline mt-2 inline-block font-bold">Perform your initial scan now →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((a) => (
                  <div 
                    key={a.id}
                    onClick={() => setSelectedAnalysis(a)}
                    className={`rounded-xl border p-4 flex justify-between items-center cursor-pointer transition ${selectedAnalysis?.id === a.id ? 'border-cyan-500 bg-cyan-500/5' : 'border-white/5 bg-slate-950/30 hover:border-white/10'}`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{a.name || 'Untitled Concept'}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 capitalize">{a.industry} • {a.target_market}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-cyan-400">{a.feasibility_score}%</p>
                        <p className="text-[9px] text-slate-500">Score</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Sessions Panel */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Active Sessions & Devices</h3>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/5 bg-slate-950/30 p-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{s.device_info || 'Unknown Browser'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      <strong className="text-slate-300">Location:</strong> {s.login_location || 'Unknown Location'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      IP: {s.ip_address || '127.0.0.1'} • Login: {s.login_time_ist || new Date(s.login_time).toLocaleString()}
                    </p>
                  </div>
                  {!s.is_current && (
                    <button 
                      onClick={() => handleTerminateSession(s.id)}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition"
                    >
                      Terminate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Selected details and audit history */}
        <div className="flex flex-col gap-6">
          {/* Subscription status card */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/40 p-6 backdrop-blur-md shadow-[0_0_20px_-10px_rgba(6,182,212,0.2)]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Tier</h3>
            <div className="mt-4 flex justify-between items-baseline">
              <span className="text-2xl font-black text-white">{user?.subscription_tier}</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user?.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                {user?.subscription_status || 'inactive'}
              </span>
            </div>
            {user?.subscription_ends_at && (
              <p className="text-[10px] text-slate-500 mt-2">
                Renews on: {new Date(user.subscription_ends_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Audit logs panel */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md max-h-[350px] overflow-y-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Security Audit Logs</h3>
            <div className="space-y-4">
              {auditLogs.map((l) => (
                <div key={l.id} className="text-xxs border-b border-white/5 pb-2">
                  <div className="flex justify-between items-center text-slate-400 font-medium">
                    <span className="truncate max-w-[150px]">{l.action.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {l.ip_address && (
                    <span className="text-slate-600 block mt-0.5">IP: {l.ip_address}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Idea details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedAnalysis(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-white mb-2">{selectedAnalysis.name || 'Startup Concept'}</h3>
            <p className="text-xs text-slate-400 mb-6 font-semibold uppercase tracking-wider border-b border-white/5 pb-2">
              Industry: {selectedAnalysis.industry} | Market: {selectedAnalysis.target_market}
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Original Pitch</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-white/5">{selectedAnalysis.pitch_text}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 text-center">
                  <p className="text-slate-500 text-[10px]">Feasibility</p>
                  <p className="text-lg font-bold text-white mt-1">{selectedAnalysis.feasibility_score}%</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 text-center">
                  <p className="text-slate-500 text-[10px]">Market Opportunity</p>
                  <p className="text-lg font-bold text-white mt-1">{selectedAnalysis.market_score}%</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 text-center">
                  <p className="text-slate-500 text-[10px]">Risk Index</p>
                  <p className="text-lg font-bold text-white mt-1">{selectedAnalysis.risk_score}%</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 text-center">
                  <p className="text-slate-500 text-[10px]">Funding Readiness</p>
                  <p className="text-lg font-bold text-white mt-1">{selectedAnalysis.funding_score}%</p>
                </div>
              </div>

              {selectedAnalysis.recommendation && (
                <div>
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">AI Mitigating Blueprint</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-white/5">{selectedAnalysis.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
