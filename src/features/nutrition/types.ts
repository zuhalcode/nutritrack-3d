import { z } from 'zod';

export type NutrientKey =
  | 'calories'
  | 'protein'
  | 'carbs'
  | 'fat'
  | 'fiber'
  | 'sugar'
  | 'sodium'
  | 'cholesterol'
  | 'caffeine';

export interface NutrientValue {
  value: number | null; // null if unknown/missing
  unit: string;
  isAvailable: boolean;
}

export interface CanonicalNutrients {
  calories: NutrientValue; // kcal
  protein: NutrientValue; // g
  carbs: NutrientValue; // g
  fat: NutrientValue; // g
  fiber: NutrientValue; // g
  sugar: NutrientValue; // g
  sodium: NutrientValue; // mg
  cholesterol: NutrientValue; // mg
  caffeine: NutrientValue; // mg
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodSearchResult {
  id: string; // provider food id
  name: string;
  description: string;
  provider: 'usda' | 'verified_db';
  brandOwner?: string;
  preparationState?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  nutrientsAvailableCount: number;
}

export interface FoodDetail {
  id: string;
  name: string;
  description: string;
  provider: 'usda' | 'verified_db';
  brandOwner?: string;
  preparationState?: string;
  referenceBasisGrams: number; // typically 100g
  nutrientsPerReference: CanonicalNutrients;
}

export interface CalculatedNutrientsResult {
  consumedGrams: number;
  nutrients: CanonicalNutrients;
}

// Zod schemas for validation
export const nutrientValueSchema = z.object({
  value: z.number().nullable(),
  unit: z.string(),
  isAvailable: z.boolean(),
});

export const canonicalNutrientsSchema = z.object({
  calories: nutrientValueSchema,
  protein: nutrientValueSchema,
  carbs: nutrientValueSchema,
  fat: nutrientValueSchema,
  fiber: nutrientValueSchema,
  sugar: nutrientValueSchema,
  sodium: nutrientValueSchema,
  cholesterol: nutrientValueSchema,
  caffeine: nutrientValueSchema,
});

export const mealCategorySchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

export const addFoodInputSchema = z.object({
  foodId: z.string().min(1, 'Food ID is required'),
  foodName: z.string().min(1, 'Food name is required'),
  description: z.string().default(''),
  provider: z.enum(['usda', 'verified_db']).default('usda'),
  consumedGrams: z.number().positive('Consumed weight must be a positive number').max(10000, 'Weight must be realistic'),
  mealCategory: mealCategorySchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  nutrientsPerReference: canonicalNutrientsSchema,
  referenceBasisGrams: z.number().positive().default(100),
});

export type AddFoodInput = z.infer<typeof addFoodInputSchema>;
