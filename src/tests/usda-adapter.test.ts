import { describe, it, expect } from 'vitest';
import { USDAProviderAdapter } from '../features/nutrition/provider/usda-adapter';

describe('USDA Provider Adapter', () => {
  const adapter = new USDAProviderAdapter();

  it('correctly searches verified fallback dataset when query matches', async () => {
    const { results, providerMode } = await adapter.searchFoods('rice');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('rice');
    expect(providerMode).toBeDefined();
  });

  it('correctly normalizes USDA raw nutrient list into CanonicalNutrients', () => {
    const rawUSDAList = [
      {
        nutrient: { id: 1008, number: '208', name: 'Energy', unitName: 'KCAL' },
        amount: 250,
      },
      {
        nutrient: { id: 1003, number: '203', name: 'Protein', unitName: 'G' },
        amount: 20.5,
      },
      {
        nutrient: { id: 1004, number: '204', name: 'Total lipid (fat)', unitName: 'G' },
        amount: 5.2,
      },
      {
        nutrient: { id: 1005, number: '205', name: 'Carbohydrate, by difference', unitName: 'G' },
        amount: 30.1,
      },
      {
        nutrient: { id: 1093, number: '307', name: 'Sodium, Na', unitName: 'MG' },
        amount: 150,
      },
    ];

    const normalized = adapter.normalizeUSDANutrients(rawUSDAList);

    expect(normalized.calories.value).toBe(250);
    expect(normalized.calories.isAvailable).toBe(true);

    expect(normalized.protein.value).toBe(20.5);
    expect(normalized.protein.isAvailable).toBe(true);

    expect(normalized.fat.value).toBe(5.2);
    expect(normalized.carbs.value).toBe(30.1);
    expect(normalized.sodium.value).toBe(150);

    // Nutrients that were not in raw list must be marked as not available, value null
    expect(normalized.caffeine.value).toBeNull();
    expect(normalized.caffeine.isAvailable).toBe(false);
    expect(normalized.cholesterol.value).toBeNull();
    expect(normalized.cholesterol.isAvailable).toBe(false);
  });

  it('retrieves detailed verified item by id', async () => {
    const { food } = await adapter.getFoodDetail('usda-168878');
    expect(food).not.toBeNull();
    expect(food?.name).toContain('Rice');
    expect(food?.nutrientsPerReference.calories.value).toBe(130);
  });
});
