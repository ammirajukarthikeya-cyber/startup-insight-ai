'use client';

import React from 'react';

interface RadarChartProps {
  feasibility: number;
  market: number;
  risk: number;
  funding: number;
  health: number;
}

export default function RadarChart({ feasibility, market, risk, funding, health }: RadarChartProps) {
  // Convert standard scores to coordinates in SVG viewBox -120 -120 240 240
  // Pentagonal axes angles: -90° (Top), -18° (Right Top), 54° (Right Bottom), 126° (Left Bottom), 198° (Left Top)
  const angle1 = -Math.PI / 2;
  const angle2 = -18 * Math.PI / 180;
  const angle3 = 54 * Math.PI / 180;
  const angle4 = 126 * Math.PI / 180;
  const angle5 = 198 * Math.PI / 180;

  // Convert scores to radius lengths (max 100)
  const r1 = market || 20;               // Market Size
  const r2 = feasibility || 20;          // Technical Feasibility
  const r3 = Math.max(20, 100 - risk);    // Regulatory Security (safety)
  const r4 = Math.max(20, Math.round((health + funding) / 2)); // Financial Margin
  const r5 = Math.max(20, Math.round(feasibility * 0.95));     // Scalability Speed

  // Calculate coordinates
  const x1 = Math.round(r1 * Math.cos(angle1));
  const y1 = Math.round(r1 * Math.sin(angle1));

  const x2 = Math.round(r2 * Math.cos(angle2));
  const y2 = Math.round(r2 * Math.sin(angle2));

  const x3 = Math.round(r3 * Math.cos(angle3));
  const y3 = Math.round(r3 * Math.sin(angle3));

  const x4 = Math.round(r4 * Math.cos(angle4));
  const y4 = Math.round(r4 * Math.sin(angle4));

  const x5 = Math.round(r5 * Math.cos(angle5));
  const y5 = Math.round(r5 * Math.sin(angle5));

  const pointsString = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4} ${x5},${y5}`;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg viewBox="-130 -130 260 260" className="h-64 w-64 overflow-visible md:h-72 md:w-72">
        {/* Background Concentric Grid Pentagons */}
        <polygon points="0,-100 95,-31 59,81 -59,81 -95,-31" className="fill-none stroke-white/10 stroke-[1.5px]" />
        <polygon points="0,-75 71,-23 44,61 -44,61 -71,-23" className="fill-none stroke-white/10 stroke-[1.5px]" />
        <polygon points="0,-50 48,-15 29,40 -29,40 -48,-15" className="fill-none stroke-white/10 stroke-[1.5px]" />
        <polygon points="0,-25 24,-8 15,20 -15,20 -24,-8" className="fill-none stroke-white/10 stroke-[1.5px]" />

        {/* Grid Axis Lines */}
        <line x1="0" y1="0" x2="0" y2="-100" className="stroke-white/10 stroke-[1.5px]" />
        <line x1="0" y1="0" x2="95" y2="-31" className="stroke-white/10 stroke-[1.5px]" />
        <line x1="0" y1="0" x2="59" y2="81" className="stroke-white/10 stroke-[1.5px]" />
        <line x1="0" y1="0" x2="-59" y2="81" className="stroke-white/10 stroke-[1.5px]" />
        <line x1="0" y1="0" x2="-95" y2="-31" className="stroke-white/10 stroke-[1.5px]" />

        {/* Dynamic Data Polygon */}
        <polygon 
          points={pointsString} 
          className="fill-cyan-500/25 stroke-cyan-400 stroke-2 transition-all duration-700 ease-out" 
        />

        {/* Data Vertices Dots */}
        <circle cx={x1} cy={y1} r="4" className="fill-cyan-400 stroke-slate-950 stroke-2 transition-all duration-700 ease-out" />
        <circle cx={x2} cy={y2} r="4" className="fill-cyan-400 stroke-slate-950 stroke-2 transition-all duration-700 ease-out" />
        <circle cx={x3} cy={y3} r="4" className="fill-cyan-400 stroke-slate-950 stroke-2 transition-all duration-700 ease-out" />
        <circle cx={x4} cy={y4} r="4" className="fill-cyan-400 stroke-slate-950 stroke-2 transition-all duration-700 ease-out" />
        <circle cx={x5} cy={y5} r="4" className="fill-cyan-400 stroke-slate-950 stroke-2 transition-all duration-700 ease-out" />

        {/* Axis Labels */}
        <text x="0" y="-112" textAnchor="middle" className="fill-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider">Market Size</text>
        <text x="105" y="-28" textAnchor="start" className="fill-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider">Technical Feasibility</text>
        <text x="68" y="93" textAnchor="start" className="fill-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider">Regulatory Security</text>
        <text x="-68" y="93" textAnchor="end" className="fill-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider">Financial Margin</text>
        <text x="-105" y="-28" textAnchor="end" className="fill-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider">Scalability Speed</text>
      </svg>
    </div>
  );
}
