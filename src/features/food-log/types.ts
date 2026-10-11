import { CanonicalNutrients, MealCategory } from '../nutrition/types';

export interface FoodLogEntry {
  id: string;
  foodName: string;
  provider: 'usda' | 'verified_db';
  providerFoodId: string;
  description: string;
  preparationState?: string;
  consumedGrams: number;
  nutrients: CanonicalNutrients; // Immutable snapshot at time of logging
  mealCategory: MealCategory;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

export interface NutrientTargets {
  calories: number; // kcal e.g. 2100
  protein: number; // g e.g. 140
  carbs: number; // g e.g. 240
  fat: number; // g e.g. 65
  fiber: number; // g e.g. 30
  sodium: number; // mg e.g. 2300
}

export interface GamificationRecord {
  xp: number;
  level: number;
  streakDays: number;
  achievedMilestones: string[];
  lastAward?: {
    id: string;
    title: string;
    xp: number;
    description: string;
    timestamp: string;
  };
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  entryCount: number;
  calorieTarget: number;
  calorieRemaining: number;
  calorieProgressRatio: number;
  aggregatedNutrients: CanonicalNutrients;
  hasIncompleteData: boolean;
}
