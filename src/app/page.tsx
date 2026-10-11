'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { FoodLogSection } from '../components/FoodLogSection';
import { AddFoodModal } from '../features/nutrition/components/AddFoodModal';
import { TargetSettingsModal } from '../components/TargetSettingsModal';
import { MilestoneCelebration } from '../components/MilestoneCelebration';
import { MealCategory } from '../features/nutrition/types';
import { Database, ShieldCheck, Plus } from 'lucide-react';

export default function Home() {
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<MealCategory>('lunch');

  // Handle Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSelectedMealForAdd('lunch');
        setIsAddFoodOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openAddFood = (meal: MealCategory = 'lunch') => {
    setSelectedMealForAdd(meal);
    setIsAddFoodOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090c] text-[#f3f4f6] flex flex-col selection:bg-[#b6f028] selection:text-black">
      {/* Top Application Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-10 pb-20 sm:pb-16">
        {/* Hero Section with 3D Canvas & Caloric Progress */}
        <HeroSection onOpenAddFood={() => openAddFood('lunch')} />

        {/* Daily Food Log Timeline */}
        <FoodLogSection onOpenAddFoodForMeal={(meal) => openAddFood(meal)} />
      </main>

      {/* Mobile Floating Action Button (Quick Log Food) */}
      <div className="fixed bottom-5 right-4 z-40 sm:hidden">
        <button
          onClick={() => openAddFood('lunch')}
          className="h-12 w-12 rounded-full bg-[#b6f028] text-[#08090c] flex items-center justify-center shadow-[0_4px_25px_rgba(182,240,40,0.45)] active:scale-95 transition-transform touch-manipulation cursor-pointer border border-[#c6fa38]/50"
          aria-label="Quick record food"
          title="Record food intake"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals & Celebrations */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        defaultMeal={selectedMealForAdd}
      />

      <TargetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <MilestoneCelebration />

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#07080a] py-6 sm:py-8 text-[11px] sm:text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#b6f028] shrink-0" />
            <span>Nutritional Data sourced from USDA FoodData Central & Indonesian TKPI</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <span className="flex items-center gap-1 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Formula Calculated • No Guessing
            </span>
            <span className="text-zinc-600">NutriTrack 3D MVP © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
