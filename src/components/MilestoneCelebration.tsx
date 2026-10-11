'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X } from 'lucide-react';
import { useFoodLogStore } from '../features/food-log/store';

export function MilestoneCelebration() {
  const lastAward = useFoodLogStore((s) => s.gamification.lastAward);
  const dismissLastAward = useFoodLogStore((s) => s.dismissLastAward);

  if (!lastAward) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#0f1420] border border-[#b6f028]/40 shadow-[0_10px_40px_rgba(182,240,40,0.25)] flex items-start gap-3 sm:gap-3.5 relative overflow-hidden"
        >
          {/* Subtle neon glow sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#b6f028]/5 to-transparent pointer-events-none" />

          <div className="p-2 sm:p-2.5 rounded-xl bg-[#b6f028]/15 text-[#b6f028] border border-[#b6f028]/30 shrink-0">
            <Trophy className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>

          <div className="flex-1 pr-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#b6f028] font-bold">
                Milestone Achieved
              </span>
              <span className="text-xs font-mono font-bold text-white">+{lastAward.xp} XP</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5 truncate">{lastAward.title}</h4>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{lastAward.description}</p>
          </div>

          <button
            onClick={dismissLastAward}
            aria-label="Dismiss milestone"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors touch-manipulation cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
