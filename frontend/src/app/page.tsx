'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
      {/* 1. Hero Section */}
      <section className="w-full max-w-7xl py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6 text-left">
          <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            GPT-5 Powered Startup Validation Engine
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans leading-tight text-white tracking-tight">
            Validate, Analyze & <br />
            <span className="text-gradient-purple-cyan font-extrabold">Scale Your Startup</span> with AI
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
            Startup Insight AI leverages deep industry intelligence to scan business concepts, map competitor ecosystems, predict compliance vulnerabilities, and match you with VC funding sources in seconds.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <Link 
              href="/analyzer" 
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-8 py-4 text-sm font-bold text-white shadow-lg transition duration-200"
            >
              Analyze My Startup Idea
            </Link>
            <Link 
              href="/events" 
              className="rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/50 hover:bg-slate-900 px-8 py-4 text-sm font-bold text-slate-300 transition duration-200"
            >
              Explore Opportunities
            </Link>
          </div>
          
          {/* Quick Metrics Statistics */}
          <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8 mt-4 max-w-md">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">14,240+</p>
              <p className="text-xxs text-slate-500 uppercase tracking-widest font-semibold mt-1">Ideas Validated</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">₹3.5B+</p>
              <p className="text-xxs text-slate-500 uppercase tracking-widest font-semibold mt-1">Capital Secured</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">94.8%</p>
              <p className="text-xxs text-slate-500 uppercase tracking-widest font-semibold mt-1">Scan Accuracy</p>
            </div>
          </div>
        </div>

        {/* Right side Visual Card */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
          <div className="w-full rounded-2xl border border-white/15 bg-slate-950/70 p-1 shadow-2xl backdrop-blur-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-80 transition duration-500" />
            
            <div className="rounded-[14px] bg-slate-950 p-6 flex flex-col gap-6 relative z-10">
              {/* Fake dashboard headers */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">https://console.startupinsight.ai/dashboard</span>
              </div>

              {/* Demo radar chart coordinates */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
                <div className="h-36 w-36 bg-slate-900/50 rounded-full border border-white/10 flex items-center justify-center relative">
                  {/* Visual mockup drawing */}
                  <div className="absolute inset-2 border border-dashed border-white/5 rounded-full" />
                  <svg viewBox="-50 -50 100 100" className="h-28 w-28 overflow-visible">
                    <polygon points="0,-40 38,-12 24,32 -24,32 -38,-12" className="fill-none stroke-white/5" />
                    <polygon points="0,-32 30,-10 20,25 -20,25 -30,-10" className="fill-none stroke-white/10" />
                    {/* Active mock data */}
                    <polygon points="0,-35 28,-5 18,20 -15,15 -25,-8" className="fill-cyan-500/20 stroke-cyan-400 stroke-[1.5]" />
                  </svg>
                </div>
                
                <div className="flex-1 flex flex-col gap-3 w-full">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">AI Feasibility Score</span>
                    <span className="text-emerald-400 font-bold">87.2 / 100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[87.2%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Market Potential</span>
                    <span className="text-cyan-400 font-bold">91.5 / 100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full w-[91.5%]" />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Regulatory Security</span>
                    <span className="text-purple-400 font-bold">Low Risk (88%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[88%]" />
                  </div>
                </div>
              </div>

              {/* Action summary info */}
              <div className="rounded-lg bg-slate-900/60 border border-white/5 p-4 text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200">AI Mentor Insight:</strong> &quot;Concept demonstrates strong structural scalability. Target developer team pilot trials in APAC sector immediately to lock initial feedback runways.&quot;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Core features mapping list */}
      <section className="w-full max-w-7xl py-16 border-t border-white/5">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-12">
          Investor-Ready <span className="text-gradient-cyan">Startup Analytics Suite</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col gap-3 hover:border-cyan-500/30 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Idea Analysis Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Verify startup ideas, select industries, target markets, and evaluate feasibility indices, SWOT profiles, and market margins.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col gap-3 hover:border-purple-500/30 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Vulnerability Scanner</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Predict legal liabilities, Cash-burn risk vectors, infrastructure threats, and regulatory compliance blocks prior to VC pitch sessions.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col gap-3 hover:border-emerald-500/30 transition duration-300 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Sponsor & VC Discovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find matching venture capital firms, angel networks, accelerators, and government grant schemes tailored to your specific industry.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
