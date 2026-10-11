'use client';

import React from 'react';
import { useDailySummary } from '../../food-log/store';

export function WebGLFallback() {
  const summary = useDailySummary();
  const progressPercent = Math.min(100, Math.round(summary.calorieProgressRatio * 100));

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer radial rings */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#b6f028]/40 animate-spin" style={{ animationDuration: '24s' }} />
        <div className="absolute inset-3 rounded-full border border-dotted border-[#22d3ee]/40 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />
        <div className="absolute inset-6 rounded-full border border-[#a855f7]/30 animate-pulse" />

        {/* Center radial glowing sphere */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#172033] via-[#0f172a] to-[#1e293b] border border-[#b6f028]/60 shadow-[0_0_40px_rgba(182,240,40,0.25)] flex flex-col items-center justify-center">
          <span className="text-xs font-mono text-[#b6f028] tracking-widest uppercase">Energy Core</span>
          <span className="text-xl font-bold font-mono text-white">{progressPercent}%</span>
          <span className="text-[10px] text-zinc-400">of daily goal</span>
        </div>
      </div>

      <div className="mt-4 max-w-xs">
        <p className="text-xs text-zinc-400 font-mono">
          [WebGL Accelerated Viewport Standby]
        </p>
      </div>
    </div>
  );
}
