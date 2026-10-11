'use client';

import React from 'react';
import { Flame, Sparkles, SlidersHorizontal, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useFoodLogStore } from '../features/food-log/store';
import { motion } from 'motion/react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const selectedDate = useFoodLogStore((s) => s.selectedDate);
  const setSelectedDate = useFoodLogStore((s) => s.setSelectedDate);
  const gamification = useFoodLogStore((s) => s.gamification);

  const [todayStr, setTodayStr] = React.useState<string>('');

  React.useEffect(() => {
    const today = new Date();
    setTodayStr(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  }, []);

  const formatDateLabel = (dateStr: string) => {
    if (todayStr && dateStr === todayStr) {
      return 'Today';
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${months[monthIndex] || ''} ${day}`;
    }
    return dateStr;
  };

  const shiftDate = (deltaDays: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + deltaDays);
    const newStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    setSelectedDate(newStr);
  };

  // XP progress to next level
  const currentLevelBaseXp = Math.pow(gamification.level - 1, 2) * 100;
  const nextLevelXp = Math.pow(gamification.level, 2) * 100;
  const levelProgress = Math.min(100, Math.max(0, ((gamification.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp || 1)) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#08090c]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Live System Pulse */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#121622] border border-[#b6f028]/30 shadow-[0_0_15px_rgba(182,240,40,0.2)]">
            <Activity className="w-5 h-5 text-[#b6f028]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b6f028] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#b6f028]"></span>
            </span>
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Nutri<span className="text-[#b6f028]">Track</span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 uppercase tracking-widest border border-white/[0.05]">
                3D MVP
              </span>
            </span>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2 py-0.5 sm:py-1 rounded-xl bg-[#121622] border border-white/[0.08]">
          <button
            onClick={() => shiftDate(-1)}
            aria-label="Previous day"
            className="w-8 h-8 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-1 sm:px-2 text-[11px] sm:text-xs font-mono font-medium text-zinc-200 min-w-[65px] sm:min-w-[90px] text-center">
            {formatDateLabel(selectedDate)}
          </span>
          <button
            onClick={() => shiftDate(1)}
            aria-label="Next day"
            className="w-8 h-8 sm:w-8 sm:h-8 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Gamification & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Streak Indicator (tablet and desktop) */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121622] border border-white/[0.08]">
            <Flame className={`w-4 h-4 ${gamification.streakDays > 0 ? 'text-amber-400 fill-amber-400/20' : 'text-zinc-500'}`} />
            <span className="text-xs font-mono font-medium text-zinc-300">
              {gamification.streakDays}d streak
            </span>
          </div>

          {/* Level & XP Meter */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#121622] border border-white/[0.08]">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#22d3ee]" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono leading-none">
                <span className="text-zinc-400 hidden xs:inline">LVL</span>
                <span className="font-bold text-[#22d3ee]">{gamification.level}</span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500 hidden sm:inline">({gamification.xp} XP)</span>
              </div>
              <div className="hidden sm:block w-16 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#22d3ee] to-[#b6f028]"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Targets Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Nutritional targets settings"
            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[38px] min-h-[38px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-xl bg-[#121622] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-[#b6f028]/40 hover:bg-[#1a2030] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
