'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check, Loader2, Sparkles, Scale, Info, AlertTriangle } from 'lucide-react';
import { FoodDetail, FoodSearchResult, MealCategory } from '../types';
import { calculateNutrientsForWeight, formatNutrientValue } from '../calculations';
import { useFoodLogStore } from '../../food-log/store';
import { useAnimationStore } from '../../experience/orchestrator/animation-store';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeal?: MealCategory;
}

export function AddFoodModal({ isOpen, onClose, defaultMeal = 'lunch' }: AddFoodModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<FoodDetail | null>(null);
  const [consumedGrams, setConsumedGrams] = useState<number>(150);
  const [mealCategory, setMealCategory] = useState<MealCategory>(defaultMeal);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addEntry = useFoodLogStore((s) => s.addEntry);
  const selectedDate = useFoodLogStore((s) => s.selectedDate);
  const dispatch = useAnimationStore((s) => s.dispatch);

  // Focus search input upon open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      dispatch({ type: 'dialog:closed' });
    }
  }, [isOpen, dispatch]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    const trimmed = val.trim();

    if (!trimmed) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch({ type: 'food-search:started' });
    setIsLoading(true);
    setErrorMessage(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          if (data.message) {
            setProviderNotice(data.message);
          }
        } else {
          setErrorMessage('Unable to retrieve search results. Check network connection.');
          dispatch({ type: 'food-search:failed', payload: { error: 'Network error' } });
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setErrorMessage('Search request failed.');
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedFoodDetail(null);
    setErrorMessage(null);
    setConsumedGrams(150);
    onClose();
  };

  // Handle food selection
  const handleSelectFood = async (food: FoodSearchResult) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/foods/${encodeURIComponent(food.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.food) {
          setSelectedFoodDetail(data.food);
          dispatch({
            type: 'food:selected',
            payload: {
              foodName: data.food.name,
              calories: data.food.nutrientsPerReference.calories.value || 0,
            },
          });
        }
      } else {
        setErrorMessage('Failed to fetch detailed nutrient composition.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error retrieving food details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time calculated nutrients preview based on grams
  const calculatedNutrients = selectedFoodDetail && consumedGrams > 0
    ? calculateNutrientsForWeight(
        selectedFoodDetail.nutrientsPerReference,
        consumedGrams,
        selectedFoodDetail.referenceBasisGrams || 100
      )
    : null;

  // Handle Save
  const handleSave = () => {
    if (!selectedFoodDetail || !calculatedNutrients || consumedGrams <= 0) {
      setErrorMessage('Please select a valid food and enter consumed weight in grams.');
      return;
    }

    dispatch({ type: 'food:save-started' });

    try {
      const { newEntry, newMilestones } = addEntry({
        foodName: selectedFoodDetail.name,
        provider: selectedFoodDetail.provider,
        providerFoodId: selectedFoodDetail.id,
        description: selectedFoodDetail.description,
        preparationState: selectedFoodDetail.preparationState,
        consumedGrams,
        nutrients: calculatedNutrients,
        mealCategory,
        date: selectedDate,
      });

      // Trigger animation event sequence
      dispatch({
        type: 'food:saved',
        payload: {
          foodName: newEntry.foodName,
          calories: calculatedNutrients.calories.value || 0,
        },
      });

      if (newMilestones.length > 0) {
        setTimeout(() => {
          dispatch({
            type: 'milestone:achieved',
            payload: {
              title: newMilestones[0].title,
              xp: newMilestones[0].xpReward,
            },
          });
        }, 600);
      }

      handleClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to save food log entry.');
      dispatch({ type: 'food-search:failed', payload: { error: 'Save failed' } });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window / Mobile Bottom Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#0e1118] border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh]"
        >
          {/* Mobile Sheet Drag Indicator */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 -mb-1 sm:hidden shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#121622]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#b6f028]/10 text-[#b6f028] border border-[#b6f028]/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">Record Nutrition</h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">Search database & specify grams consumed</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors touch-manipulation cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
            {/* Search Input Bar (text-base on mobile to avoid iOS Safari auto-zoom) */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search food (e.g., cooked rice, chicken, oats)..."
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 sm:py-3 bg-[#151926] border border-white/[0.1] rounded-xl text-base sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#b6f028] focus:ring-1 focus:ring-[#b6f028] transition-all"
              />
              {isLoading && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b6f028] animate-spin" />
              )}
              {query && !isLoading && (
                <button
                  onClick={() => handleQueryChange('')}
                  aria-label="Clear search input"
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white touch-manipulation"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Provider Notice Banner if present */}
            {providerNotice && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#182030] border border-cyan-500/20 text-[11px] text-cyan-300">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{providerNotice}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Search Results List (if no food selected yet) */}
            {!selectedFoodDetail && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>DATABASE MATCHES</span>
                  {results.length > 0 && <span>{results.length} results</span>}
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {results.length === 0 && query.trim() !== '' && !isLoading && (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      No matching foods found in verified databases for &ldquo;{query}&rdquo;.
                    </div>
                  )}

                  {results.length === 0 && query.trim() === '' && (
                    <div className="p-4 rounded-xl bg-[#121622]/40 border border-dashed border-white/[0.06] text-center text-xs text-zinc-400 space-y-1">
                      <p>Type any food name above to query real nutritional composition records.</p>
                      <p className="text-[11px] text-zinc-500">Popular: cooked white rice, grilled chicken, tempeh, salmon, oatmeal, avocado.</p>
                    </div>
                  )}

                  {results.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className="w-full text-left p-3 rounded-xl bg-[#131724] hover:bg-[#1a2032] border border-white/[0.06] hover:border-[#b6f028]/40 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white group-hover:text-[#b6f028] transition-colors truncate">
                            {food.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.05]">
                            {food.provider === 'usda' ? 'USDA FDC' : 'Verified TKPI'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {food.preparationState ? `${food.preparationState} • ` : ''}
                          {food.description}
                        </p>
                      </div>
                      <span className="text-xs text-[#b6f028] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Selected Food Details & Consumed Weight Configuration */}
            {selectedFoodDetail && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Selected Food Bar */}
                <div className="p-3.5 rounded-xl bg-[#131826] border border-[#b6f028]/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{selectedFoodDetail.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#b6f028]/10 text-[#b6f028] border border-[#b6f028]/20">
                        Selected
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {selectedFoodDetail.preparationState || selectedFoodDetail.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFoodDetail(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-white underline font-mono shrink-0"
                  >
                    Change
                  </button>
                </div>

                {/* Meal Category & Consumed Grams Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Meal Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">MEAL CATEGORY</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setMealCategory(cat)}
                          className={`min-h-[44px] py-2 px-3 text-xs font-medium rounded-xl capitalize transition-all border flex items-center justify-center touch-manipulation cursor-pointer ${
                            mealCategory === cat
                              ? 'bg-[#b6f028]/15 border-[#b6f028] text-[#b6f028]'
                              : 'bg-[#151926] border-white/[0.08] text-zinc-300 hover:bg-[#1c2234]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Consumed Grams */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#b6f028]" />
                        WEIGHT CONSUMED (GRAMS)
                      </label>
                      <span className="text-xs font-mono font-bold text-[#b6f028]">{consumedGrams} g</span>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="number"
                        min="1"
                        max="2500"
                        value={consumedGrams}
                        onChange={(e) => setConsumedGrams(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full min-h-[44px] px-3.5 py-2 bg-[#151926] border border-white/[0.1] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#b6f028]"
                      />
                      <input
                        type="range"
                        min="25"
                        max="600"
                        step="5"
                        value={consumedGrams}
                        onChange={(e) => setConsumedGrams(parseInt(e.target.value))}
                        className="w-full h-6 accent-[#b6f028] touch-manipulation cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>50g</span>
                        <span>150g</span>
                        <span>300g</span>
                        <span>500g</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Automatic Nutritional Preview (Calculated strictly via formula) */}
                {calculatedNutrients && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#121622] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-300">CALCULATED FOR {consumedGrams}g</span>
                      <span className="text-xs font-mono text-[#b6f028]">Auto Formula</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 sm:p-2.5 rounded-lg bg-[#0e1118] border border-white/[0.05]">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block">Calories</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-white">
                          {formatNutrientValue(calculatedNutrients.calories, 0)}
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-[#0e1118] border border-cyan-500/20">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase block">Protein</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-cyan-200">
                          {formatNutrientValue(calculatedNutrients.protein, 1)}
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-[#0e1118] border border-[#b6f028]/20">
                        <span className="text-[10px] font-mono text-[#b6f028] uppercase block">Carbs</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-lime-200">
                          {formatNutrientValue(calculatedNutrients.carbs, 1)}
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-[#0e1118] border border-purple-500/20">
                        <span className="text-[10px] font-mono text-purple-400 uppercase block">Fat</span>
                        <span className="text-base sm:text-lg font-bold font-mono text-purple-200">
                          {formatNutrientValue(calculatedNutrients.fat, 1)}
                        </span>
                      </div>
                    </div>

                    {/* Secondary Nutrients Bar */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-400 pt-2 border-t border-white/[0.04] font-mono">
                      <span>Fiber: {formatNutrientValue(calculatedNutrients.fiber, 1)}</span>
                      <span>Sugar: {formatNutrientValue(calculatedNutrients.sugar, 1)}</span>
                      <span>Sodium: {formatNutrientValue(calculatedNutrients.sodium, 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/[0.08] bg-[#121622]/80 backdrop-blur-sm flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="min-h-[44px] px-4 py-2.5 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-colors touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedFoodDetail || consumedGrams <= 0}
              className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all touch-manipulation cursor-pointer ${
                selectedFoodDetail && consumedGrams > 0
                  ? 'bg-[#b6f028] hover:bg-[#cbfb48] text-[#08090c] shadow-[0_0_20px_rgba(182,240,40,0.3)]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Save to Food Log
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
