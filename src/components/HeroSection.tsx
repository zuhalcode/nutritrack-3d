'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { Plus, Flame, Zap } from 'lucide-react';
import { useDailySummary, useFoodLogStore } from '../features/food-log/store';
import { useAnimationStore } from '../features/experience/orchestrator/animation-store';
import { WebGLFallback } from '../features/experience/fallback/WebGLFallback';

// Lazy-load heavy 3D canvas with fallback
const KineticCoreScene = dynamic(
  () =>
    import('../features/experience/scene/KineticCoreScene').then(
      (mod) => mod.KineticCoreScene
    ),
  {
    ssr: false,
    loading: () => <WebGLFallback />,
  }
);

interface HeroSectionProps {
  onOpenAddFood: () => void;
}

export function HeroSection({ onOpenAddFood }: HeroSectionProps) {
  const summary = useDailySummary();
  const targets = useFoodLogStore((s) => s.targets);
  const currentState = useAnimationStore((s) => s.currentState);

  const calProgress = Math.min(100, Math.round(summary.calorieProgressRatio * 100));
  const proteinProgress = Math.min(100, Math.round((summary.totalProtein / (targets.protein || 1)) * 100));
  const carbsProgress = Math.min(100, Math.round((summary.totalCarbs / (targets.carbs || 1)) * 100));
  const fatProgress = Math.min(100, Math.round((summary.totalFat / (targets.fat || 1)) * 100));

  return (
    <section className="relative w-full py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Kinetic Energy Core Stage (7 Columns) */}
        <div className="lg:col-span-7 relative rounded-3xl bg-[#0b0e15] border border-white/[0.08] p-4 sm:p-6 overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Subtle background ambient gradients */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#b6f028]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#22d3ee]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Overlays: System Mode & Calorie Live Status */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#b6f028] animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-300">
                KINETIC ENERGY CORE
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-[#141926] border border-white/[0.06] text-[10px] font-mono text-zinc-400">
              STATE: <span className="text-[#b6f028] font-bold uppercase">{currentState}</span>
            </div>
          </div>

          {/* Real-time 3D Canvas */}
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] my-2">
            <KineticCoreScene />

            {/* Satellite Floating Macro Indicators */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e121a]/90 backdrop-blur-md border border-[#22d3ee]/30 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                <span className="text-zinc-400">Protein:</span>
                <span className="text-white font-bold">{Math.round(summary.totalProtein)}g</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e121a]/90 backdrop-blur-md border border-[#b6f028]/30 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#b6f028]" />
                <span className="text-zinc-400">Carbs:</span>
                <span className="text-white font-bold">{Math.round(summary.totalCarbs)}g</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e121a]/90 backdrop-blur-md border border-[#a855f7]/30 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                <span className="text-zinc-400">Fat:</span>
                <span className="text-white font-bold">{Math.round(summary.totalFat)}g</span>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Notice */}
          <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 font-mono pt-2 border-t border-white/[0.06]">
            <span>Interactive 3D • Drag to rotate camera</span>
            <span className="text-[#b6f028] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Dynamic Metabolic Feedback
            </span>
          </div>
        </div>

        {/* Nutritional Summary & Progress Console (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Caloric Equilibrium Card */}
          <div className="rounded-3xl bg-[#0e121a] border border-white/[0.08] p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#b6f028]/10 text-[#b6f028] border border-[#b6f028]/20">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Caloric Equilibrium</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400">
                {calProgress}%
              </span>
            </div>

            {/* Giant Metric Display */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {Math.round(summary.totalCalories)}
              </span>
              <span className="text-sm font-mono text-zinc-400">
                / {targets.calories} kcal
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-mono mb-6">
              {summary.calorieRemaining > 0 ? (
                <>
                  <span className="text-[#b6f028] font-bold">{Math.round(summary.calorieRemaining)} kcal</span> remaining to reach target
                </>
              ) : (
                <span className="text-[#22d3ee] font-bold">Daily caloric target reached</span>
              )}
            </p>

            {/* Calorie Progress Bar */}
            <div className="w-full h-2.5 bg-[#171d2c] rounded-full overflow-hidden p-0.5 border border-white/[0.05] mb-6">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] via-[#b6f028] to-[#ccff00]"
                initial={{ width: 0 }}
                animate={{ width: `${calProgress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Macronutrient Distribution Gauges */}
            <div className="space-y-3.5 pt-4 border-t border-white/[0.06]">
              {/* Protein */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                    Protein
                  </span>
                  <span className="text-zinc-300">
                    {Math.round(summary.totalProtein)}g / {targets.protein}g ({proteinProgress}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#171d2c] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#22d3ee]"
                    initial={{ width: 0 }}
                    animate={{ width: `${proteinProgress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Carbohydrates */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-lime-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#b6f028]" />
                    Carbohydrates
                  </span>
                  <span className="text-zinc-300">
                    {Math.round(summary.totalCarbs)}g / {targets.carbs}g ({carbsProgress}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#171d2c] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#b6f028]"
                    initial={{ width: 0 }}
                    animate={{ width: `${carbsProgress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-purple-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                    Fats
                  </span>
                  <span className="text-zinc-300">
                    {Math.round(summary.totalFat)}g / {targets.fat}g ({fatProgress}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#171d2c] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#a855f7]"
                    initial={{ width: 0 }}
                    animate={{ width: `${fatProgress}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-6 pt-2">
              <button
                onClick={onOpenAddFood}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#b6f028] hover:bg-[#c6fa38] text-[#08090c] font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(182,240,40,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Record Food Intake
                <span className="ml-1 text-[11px] font-normal px-1.5 py-0.5 rounded bg-black/15 text-black">
                  Ctrl+K
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
