import { describe, it, expect, beforeEach } from 'vitest';
import { useFoodLogStore } from '../features/food-log/store';
import { CanonicalNutrients } from '../features/nutrition/types';

describe('Food Log Store & Gamification', () => {
  beforeEach(() => {
    useFoodLogStore.getState().clearAllEntries();
  });

  const mockNutrients: CanonicalNutrients = {
    calories: { value: 250, unit: 'kcal', isAvailable: true },
    protein: { value: 20, unit: 'g', isAvailable: true },
    carbs: { value: 30, unit: 'g', isAvailable: true },
    fat: { value: 5, unit: 'g', isAvailable: true },
    fiber: { value: 3, unit: 'g', isAvailable: true },
    sugar: { value: 2, unit: 'g', isAvailable: true },
    sodium: { value: 150, unit: 'mg', isAvailable: true },
    cholesterol: { value: 40, unit: 'mg', isAvailable: true },
    caffeine: { value: null, unit: 'mg', isAvailable: false },
  };

  it('adds food entry and correctly updates entries and derived summary', () => {
    const { addEntry, getDailySummary } = useFoodLogStore.getState();

    const result = addEntry({
      foodName: 'Grilled Chicken',
      provider: 'verified_db',
      providerFoodId: 'usda-171077',
      description: 'Cooked chicken breast',
      consumedGrams: 150,
      nutrients: mockNutrients,
      mealCategory: 'lunch',
      date: '2026-10-11',
    });

    expect(result.newEntry.id).toBeDefined();
    expect(useFoodLogStore.getState().entries.length).toBe(1);

    const summary = getDailySummary('2026-10-11');
    expect(summary.totalCalories).toBe(250);
    expect(summary.totalProtein).toBe(20);
    expect(summary.entryCount).toBe(1);
  });

  it('awards first_log milestone on the first entry without duplicating later', () => {
    const { addEntry } = useFoodLogStore.getState();

    const res1 = addEntry({
      foodName: 'Item 1',
      provider: 'verified_db',
      providerFoodId: '1',
      description: 'Test',
      consumedGrams: 100,
      nutrients: mockNutrients,
      mealCategory: 'breakfast',
      date: '2026-10-11',
    });

    expect(res1.newMilestones.some((m) => m.id === 'first_log')).toBe(true);

    const res2 = addEntry({
      foodName: 'Item 2',
      provider: 'verified_db',
      providerFoodId: '2',
      description: 'Test 2',
      consumedGrams: 100,
      nutrients: mockNutrients,
      mealCategory: 'lunch',
      date: '2026-10-11',
    });

    // Milestone should NOT be awarded again
    expect(res2.newMilestones.some((m) => m.id === 'first_log')).toBe(false);
  });

  it('removes food entry and recalculates totals correctly', () => {
    const { addEntry, removeEntry, getDailySummary } = useFoodLogStore.getState();

    const { newEntry } = addEntry({
      foodName: 'Item to delete',
      provider: 'verified_db',
      providerFoodId: 'del-1',
      description: 'Test',
      consumedGrams: 100,
      nutrients: mockNutrients,
      mealCategory: 'dinner',
      date: '2026-10-11',
    });

    expect(getDailySummary('2026-10-11').totalCalories).toBe(250);

    removeEntry(newEntry.id);

    expect(getDailySummary('2026-10-11').totalCalories).toBe(0);
    expect(getDailySummary('2026-10-11').entryCount).toBe(0);
  });
});
