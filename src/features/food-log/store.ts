import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailySummary, FoodLogEntry, GamificationRecord, NutrientTargets } from './types';
import { aggregateCanonicalNutrients } from '../nutrition/calculations';
import { evaluateMilestones, calculateStreak, MilestoneDefinition } from '../gamification/milestones';

interface FoodLogState {
  entries: FoodLogEntry[];
  selectedDate: string; // YYYY-MM-DD
  targets: NutrientTargets;
  gamification: GamificationRecord;
  hasHydrated: boolean;

  // Actions
  setHydrated: (state: boolean) => void;
  setSelectedDate: (date: string) => void;
  setTargets: (targets: Partial<NutrientTargets>) => void;
  addEntry: (
    entryData: Omit<FoodLogEntry, 'id' | 'createdAt'>
  ) => { newEntry: FoodLogEntry; newMilestones: MilestoneDefinition[] };
  removeEntry: (id: string) => void;
  clearAllEntries: () => void;
  importEntries: (imported: FoodLogEntry[]) => boolean;
  dismissLastAward: () => void;

  // Selectors
  getDailySummary: (date?: string) => DailySummary;
  getEntriesForSelectedDate: () => FoodLogEntry[];
}

const DEFAULT_TARGETS: NutrientTargets = {
  calories: 2150,
  protein: 135,
  carbs: 245,
  fat: 65,
  fiber: 30,
  sodium: 2300,
};

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      selectedDate: getTodayString(),
      targets: DEFAULT_TARGETS,
      gamification: {
        xp: 0,
        level: 1,
        streakDays: 0,
        achievedMilestones: [],
      },
      hasHydrated: false,

      setHydrated: (state) => set({ hasHydrated: state }),

      setSelectedDate: (date: string) => {
        set({ selectedDate: date });
      },

      setTargets: (newTargets) => {
        set((state) => ({
          targets: { ...state.targets, ...newTargets },
        }));
      },

      addEntry: (entryData) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const createdAt = new Date().toISOString();

        const newEntry: FoodLogEntry = {
          ...entryData,
          id,
          createdAt,
        };

        const currentEntries = get().entries;
        const updatedEntries = [newEntry, ...currentEntries];

        // Evaluate streak
        const streakDays = calculateStreak(updatedEntries);

        // Evaluate milestones
        const currentMilestones = get().gamification.achievedMilestones;
        const newEarned = evaluateMilestones(
          updatedEntries,
          newEntry.date,
          get().targets,
          currentMilestones
        );

        // Calculate XP
        let xpGained = 25; // base food log XP
        newEarned.forEach((m) => {
          xpGained += m.xpReward;
        });

        const newXp = get().gamification.xp + xpGained;
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        const newlyAchievedIds = [...currentMilestones, ...newEarned.map((m) => m.id)];

        set({
          entries: updatedEntries,
          gamification: {
            xp: newXp,
            level: newLevel,
            streakDays,
            achievedMilestones: newlyAchievedIds,
            lastAward: newEarned.length > 0 ? {
              id: newEarned[0].id,
              title: newEarned[0].title,
              description: newEarned[0].description,
              xp: newEarned[0].xpReward,
              timestamp: new Date().toISOString(),
            } : undefined,
          },
        });

        return { newEntry, newMilestones: newEarned };
      },

      removeEntry: (id: string) => {
        set((state) => {
          const updatedEntries = state.entries.filter((e) => e.id !== id);
          const streakDays = calculateStreak(updatedEntries);
          return {
            entries: updatedEntries,
            gamification: {
              ...state.gamification,
              streakDays,
            },
          };
        });
      },

      clearAllEntries: () => {
        set({
          entries: [],
          gamification: {
            xp: 0,
            level: 1,
            streakDays: 0,
            achievedMilestones: [],
            lastAward: undefined,
          },
        });
      },

      importEntries: (imported: FoodLogEntry[]) => {
        if (!Array.isArray(imported)) return false;
        set({ entries: imported });
        return true;
      },

      dismissLastAward: () => {
        set((state) => ({
          gamification: {
            ...state.gamification,
            lastAward: undefined,
          },
        }));
      },

      getEntriesForSelectedDate: () => {
        const { entries, selectedDate } = get();
        return entries.filter((e) => e.date === selectedDate);
      },

      getDailySummary: (date) => {
        const targetDate = date || get().selectedDate;
        const dayEntries = get().entries.filter((e) => e.date === targetDate);
        const { targets } = get();

        const nutrientSnapshots = dayEntries.map((e) => e.nutrients);
        const aggregated = aggregateCanonicalNutrients(nutrientSnapshots);

        const totalCalories = aggregated.calories.value ?? 0;
        const totalProtein = aggregated.protein.value ?? 0;
        const totalCarbs = aggregated.carbs.value ?? 0;
        const totalFat = aggregated.fat.value ?? 0;
        const totalFiber = aggregated.fiber.value ?? 0;
        const totalSodium = aggregated.sodium.value ?? 0;

        const remaining = Math.max(0, targets.calories - totalCalories);
        const progressRatio = targets.calories > 0 ? Math.min(1.5, totalCalories / targets.calories) : 0;

        // Check if any logged entry has incomplete calories
        const hasIncompleteData = dayEntries.some((e) => !e.nutrients.calories.isAvailable);

        return {
          date: targetDate,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          totalFiber,
          totalSodium,
          entryCount: dayEntries.length,
          calorieTarget: targets.calories,
          calorieRemaining: remaining,
          calorieProgressRatio: progressRatio,
          aggregatedNutrients: aggregated,
          hasIncompleteData,
        };
      },
    }),
    {
      name: 'nutritrack-foodlog-storage-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Migration from future versions if needed
        }
        return persistedState as FoodLogState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/**
 * Memoized hook to access daily nutrition summary.
 * Returns a stable reference to avoid getServerSnapshot infinite loop warnings and excessive re-renders.
 */
export function useDailySummary(date?: string): DailySummary {
  const entries = useFoodLogStore((s) => s.entries);
  const selectedDate = useFoodLogStore((s) => s.selectedDate);
  const targets = useFoodLogStore((s) => s.targets);

  const targetDate = date || selectedDate;

  return useMemo(() => {
    const dayEntries = entries.filter((e) => e.date === targetDate);
    const nutrientSnapshots = dayEntries.map((e) => e.nutrients);
    const aggregated = aggregateCanonicalNutrients(nutrientSnapshots);

    const totalCalories = aggregated.calories.value ?? 0;
    const totalProtein = aggregated.protein.value ?? 0;
    const totalCarbs = aggregated.carbs.value ?? 0;
    const totalFat = aggregated.fat.value ?? 0;
    const totalFiber = aggregated.fiber.value ?? 0;
    const totalSodium = aggregated.sodium.value ?? 0;

    const remaining = Math.max(0, targets.calories - totalCalories);
    const progressRatio = targets.calories > 0 ? Math.min(1.5, totalCalories / targets.calories) : 0;
    const hasIncompleteData = dayEntries.some((e) => !e.nutrients.calories.isAvailable);

    return {
      date: targetDate,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSodium,
      entryCount: dayEntries.length,
      calorieTarget: targets.calories,
      calorieRemaining: remaining,
      calorieProgressRatio: progressRatio,
      aggregatedNutrients: aggregated,
      hasIncompleteData,
    };
  }, [entries, targetDate, targets]);
}

/**
 * Memoized hook to access entries for the selected date.
 */
export function useEntriesForSelectedDate(): FoodLogEntry[] {
  const entries = useFoodLogStore((s) => s.entries);
  const selectedDate = useFoodLogStore((s) => s.selectedDate);

  return useMemo(() => {
    return entries.filter((e) => e.date === selectedDate);
  }, [entries, selectedDate]);
}
