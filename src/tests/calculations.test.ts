import { describe, it, expect } from 'vitest';
import {
  calculateNutrientsForWeight,
  aggregateCanonicalNutrients,
  formatNutrientValue,
} from '../features/nutrition/calculations';
import { CanonicalNutrients } from '../features/nutrition/types';

describe('Nutrient Calculations', () => {
  const sampleReferenceNutrients: CanonicalNutrients = {
    calories: { value: 130, unit: 'kcal', isAvailable: true },
    protein: { value: 2.7, unit: 'g', isAvailable: true },
    carbs: { value: 28.2, unit: 'g', isAvailable: true },
    fat: { value: 0.3, unit: 'g', isAvailable: true },
    fiber: { value: 0.4, unit: 'g', isAvailable: true },
    sugar: { value: 0.1, unit: 'g', isAvailable: true },
    sodium: { value: 1.0, unit: 'mg', isAvailable: true },
    cholesterol: { value: 0, unit: 'mg', isAvailable: true },
    caffeine: { value: null, unit: 'mg', isAvailable: false }, // explicitly missing
  };

  it('correctly calculates nutrients for 200g (double reference of 100g)', () => {
    const result = calculateNutrientsForWeight(sampleReferenceNutrients, 200, 100);

    expect(result.calories.value).toBeCloseTo(260);
    expect(result.calories.isAvailable).toBe(true);

    expect(result.protein.value).toBeCloseTo(5.4);
    expect(result.carbs.value).toBeCloseTo(56.4);
    expect(result.fat.value).toBeCloseTo(0.6);

    // Missing nutrient remains missing
    expect(result.caffeine.value).toBeNull();
    expect(result.caffeine.isAvailable).toBe(false);
  });

  it('correctly calculates nutrients for arbitrary weight (75g)', () => {
    const result = calculateNutrientsForWeight(sampleReferenceNutrients, 75, 100);

    expect(result.calories.value).toBeCloseTo(97.5);
    expect(result.protein.value).toBeCloseTo(2.025);
  });

  it('rejects invalid or zero weights with an error', () => {
    expect(() => calculateNutrientsForWeight(sampleReferenceNutrients, 0)).toThrow();
    expect(() => calculateNutrientsForWeight(sampleReferenceNutrients, -50)).toThrow();
    expect(() => calculateNutrientsForWeight(sampleReferenceNutrients, NaN)).toThrow();
  });

  it('correctly aggregates multiple nutrient records', () => {
    const item1 = calculateNutrientsForWeight(sampleReferenceNutrients, 100);
    const item2 = calculateNutrientsForWeight(sampleReferenceNutrients, 100);

    const aggregated = aggregateCanonicalNutrients([item1, item2]);

    expect(aggregated.calories.value).toBeCloseTo(260);
    expect(aggregated.protein.value).toBeCloseTo(5.4);
    expect(aggregated.caffeine.value).toBeNull();
    expect(aggregated.caffeine.isAvailable).toBe(false);
  });

  it('formats nutrient values for presentation with unit and placeholder for missing', () => {
    expect(formatNutrientValue({ value: 120.45, unit: 'kcal', isAvailable: true }, 0)).toBe('120 kcal');
    expect(formatNutrientValue({ value: 24.56, unit: 'g', isAvailable: true }, 1)).toBe('24.6 g');
    expect(formatNutrientValue({ value: null, unit: 'mg', isAvailable: false })).toBe('—');
  });
});
