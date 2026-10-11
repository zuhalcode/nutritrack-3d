'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Sun, Moon, Apple, Trash2, Plus, Scale } from 'lucide-react';
import { MealCategory } from '../features/nutrition/types';
import { useEntriesForSelectedDate, useFoodLogStore } from '../features/food-log/store';
import { formatNutrientValue } from '../features/nutrition/calculations';
import { useAnimationStore } from '../features/experience/orchestrator/animation-store';

interface FoodLogSectionProps {
  onOpenAddFoodForMeal: (meal: MealCategory) => void;
}

const MEALS: { key: MealCategory; label: string; icon: React.ComponentType<{ className?: string }>; timeHint: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, timeHint: 'Morning Refuel' },
  { key: 'lunch', label: 'Lunch', icon: Sun, timeHint: 'Midday Energy' },
  { key: 'dinner', label: 'Dinner', icon: Moon, timeHint: 'Evening Recovery' },
  { key: 'snack', label: 'Snacks & Extras', icon: Apple, timeHint: 'Nutritional Support' },
];

export function FoodLogSection({ onOpenAddFoodForMeal }: FoodLogSectionProps) {
  const entries = useEntriesForSelectedDate();
  const removeEntry = useFoodLogStore((s) => s.removeEntry);
  const dispatch = useAnimationStore((s) => s.dispatch);

  const handleDelete = (id: string) => {
    removeEntry(id);
    dispatch({ type: 'food:deleted' });
  };

  return (
    <section className="py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Metabolic Log
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400">
              {entries.length} entries recorded
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Derived directly from saved food logs and verified nutritional composition snapshots
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {MEALS.map((meal) => {
          const mealEntries = entries.filter((e) => e.mealCategory === meal.key);
          const mealCalories = mealEntries.reduce(
            (acc, curr) => acc + (curr.nutrients.calories.isAvailable ? curr.nutrients.calories.value || 0 : 0),
            0
          );
          const MealIcon = meal.icon;

          return (
            <div
              key={meal.key}
              className="rounded-2xl bg-[#0d1017] border border-white/[0.06] overflow-hidden"
            >
              {/* Meal Group Header */}
              <div className="p-4 bg-[#111520]/80 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.04] text-zinc-300 border border-white/[0.05]">
                    <MealIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">{meal.label}</h3>
                    <span className="text-[10px] text-zinc-500 font-mono">{meal.timeHint}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#b6f028]">
                    {Math.round(mealCalories)} kcal
                  </span>
                  <button
                    onClick={() => onOpenAddFoodForMeal(meal.key)}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#b6f028]/20 hover:text-[#b6f028] text-zinc-400 border border-white/[0.06] transition-colors"
                    title={`Add food to ${meal.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meal Items List */}
              <div className="divide-y divide-white/[0.04]">
                {mealEntries.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-xs text-zinc-500 font-mono">No items logged for {meal.label}.</p>
                    <button
                      onClick={() => onOpenAddFoodForMeal(meal.key)}
                      className="mt-2 text-xs font-mono text-[#b6f028] hover:underline"
                    >
                      + Add food
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {mealEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121622]/40 transition-colors group"
                      >
                        {/* Food Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{entry.foodName}</span>
                            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                              <Scale className="w-3 h-3 text-zinc-500" />
                              {entry.consumedGrams}g
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-500">
                              {entry.provider === 'usda' ? 'USDA' : 'Verified'}
                            </span>
                          </div>
                          {entry.preparationState && (
                            <p className="text-xs text-zinc-500">{entry.preparationState}</p>
                          )}
                        </div>

                        {/* Nutrition Snapshot Badges & Delete */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="flex items-center gap-1.5 text-xs font-mono">
                            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-200 font-bold border border-white/[0.05]">
                              {formatNutrientValue(entry.nutrients.calories, 0)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-950/30 text-cyan-300 border border-cyan-500/20">
                              P: {formatNutrientValue(entry.nutrients.protein, 1)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-lime-950/30 text-lime-300 border border-lime-500/20">
                              C: {formatNutrientValue(entry.nutrients.carbs, 1)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-purple-950/30 text-purple-300 border border-purple-500/20">
                              F: {formatNutrientValue(entry.nutrients.fat, 1)}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
