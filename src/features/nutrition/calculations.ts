import { CanonicalNutrients, NutrientKey, NutrientValue } from './types';

/**
 * Calculates canonical nutrient amounts for a specified consumed weight in grams.
 * Formula: calculatedValue = (valuePerReference * consumedGrams) / referenceBasisGrams
 * Missing nutrients remain explicitly missing (null), never converted to 0.
 */
export function calculateNutrientsForWeight(
  referenceNutrients: CanonicalNutrients,
  consumedGrams: number,
  referenceBasisGrams: number = 100
): CanonicalNutrients {
  if (typeof consumedGrams !== 'number' || !Number.isFinite(consumedGrams) || consumedGrams <= 0) {
    throw new Error(`Invalid consumed weight: ${consumedGrams}. Must be a positive finite number.`);
  }

  if (typeof referenceBasisGrams !== 'number' || !Number.isFinite(referenceBasisGrams) || referenceBasisGrams <= 0) {
    throw new Error(`Invalid reference basis weight: ${referenceBasisGrams}. Must be a positive finite number.`);
  }

  const ratio = consumedGrams / referenceBasisGrams;

  const result: Partial<CanonicalNutrients> = {};
  const keys: NutrientKey[] = [
    'calories',
    'protein',
    'carbs',
    'fat',
    'fiber',
    'sugar',
    'sodium',
    'cholesterol',
    'caffeine',
  ];

  for (const key of keys) {
    const ref = referenceNutrients[key];
    if (ref && ref.isAvailable && ref.value !== null && Number.isFinite(ref.value)) {
      result[key] = {
        value: ref.value * ratio,
        unit: ref.unit,
        isAvailable: true,
      };
    } else {
      result[key] = {
        value: null,
        unit: ref?.unit || (key === 'calories' ? 'kcal' : key === 'sodium' || key === 'cholesterol' || key === 'caffeine' ? 'mg' : 'g'),
        isAvailable: false,
      };
    }
  }

  return result as CanonicalNutrients;
}

/**
 * Aggregates a list of canonical nutrients into total values.
 * If all entries lack data for a nutrient, the aggregated result reflects it as missing.
 */
export function aggregateCanonicalNutrients(
  nutrientList: CanonicalNutrients[]
): CanonicalNutrients {
  const keys: NutrientKey[] = [
    'calories',
    'protein',
    'carbs',
    'fat',
    'fiber',
    'sugar',
    'sodium',
    'cholesterol',
    'caffeine',
  ];

  const initial: Record<NutrientKey, { total: number; count: number; unit: string }> = {
    calories: { total: 0, count: 0, unit: 'kcal' },
    protein: { total: 0, count: 0, unit: 'g' },
    carbs: { total: 0, count: 0, unit: 'g' },
    fat: { total: 0, count: 0, unit: 'g' },
    fiber: { total: 0, count: 0, unit: 'g' },
    sugar: { total: 0, count: 0, unit: 'g' },
    sodium: { total: 0, count: 0, unit: 'mg' },
    cholesterol: { total: 0, count: 0, unit: 'mg' },
    caffeine: { total: 0, count: 0, unit: 'mg' },
  };

  for (const item of nutrientList) {
    for (const key of keys) {
      const val = item[key];
      if (val && val.isAvailable && val.value !== null) {
        initial[key].total += val.value;
        initial[key].count += 1;
        initial[key].unit = val.unit;
      }
    }
  }

  const result: Partial<CanonicalNutrients> = {};
  for (const key of keys) {
    const { total, count, unit } = initial[key];
    if (count > 0) {
      result[key] = {
        value: total,
        unit,
        isAvailable: true,
      };
    } else {
      result[key] = {
        value: null,
        unit,
        isAvailable: false,
      };
    }
  }

  return result as CanonicalNutrients;
}

/**
 * Format helper for UI presentation.
 */
export function formatNutrientValue(
  nutrient: NutrientValue | undefined,
  precision: number = 1
): string {
  if (!nutrient || !nutrient.isAvailable || nutrient.value === null) {
    return '—';
  }
  if (precision === 0) {
    return `${Math.round(nutrient.value)} ${nutrient.unit}`;
  }
  return `${nutrient.value.toFixed(precision)} ${nutrient.unit}`;
}
