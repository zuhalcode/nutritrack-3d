import { CanonicalNutrients, FoodDetail, FoodSearchResult, NutrientValue } from '../types';
import { getVerifiedFoodById, searchVerifiedFoods } from './verified-foods-db';

interface USDANutrient {
  nutrientId?: number;
  nutrientNumber?: string;
  nutrientName?: string;
  unitName?: string;
  value?: number;
  amount?: number;
}

interface USDAFoodSearchItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients?: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDAFoodDetailItem {
  fdcId: number;
  description: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: {
    nutrient: {
      id: number;
      number: string;
      name: string;
      unitName: string;
    };
    amount: number;
  }[];
}

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export class USDAProviderAdapter {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.USDA_FDC_API_KEY || null;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim() !== '');
  }

  /**
   * Search foods via USDA FoodData Central or verified composition database.
   */
  async searchFoods(query: string, signal?: AbortSignal): Promise<{
    results: FoodSearchResult[];
    providerMode: 'live_usda' | 'verified_dataset';
    message?: string;
  }> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { results: [], providerMode: this.hasApiKey() ? 'live_usda' : 'verified_dataset' };
    }

    // If API key is present, attempt live USDA search
    if (this.hasApiKey()) {
      try {
        const url = `${USDA_BASE_URL}/foods/search?api_key=${encodeURIComponent(
          this.apiKey!
        )}&query=${encodeURIComponent(trimmed)}&pageSize=20&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)`;

        const res = await fetch(url, {
          signal,
          headers: { Accept: 'application/json' },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = await res.json();
          const foods: USDAFoodSearchItem[] = data.foods || [];

          const mapped: FoodSearchResult[] = foods.map((f) => ({
            id: String(f.fdcId),
            name: f.description,
            description: `${f.brandOwner ? `${f.brandOwner} — ` : ''}FDC #${f.fdcId}`,
            provider: 'usda',
            brandOwner: f.brandOwner,
            servingSize: f.servingSize,
            servingSizeUnit: f.servingSizeUnit,
            nutrientsAvailableCount: f.foodNutrients?.length || 0,
          }));

          // Also include any Indonesian staple matches if relevant
          const indonesianMatches = searchVerifiedFoods(trimmed).filter(
            (item) => item.provider === 'verified_db' && item.id.startsWith('tkpi')
          );

          return {
            results: [...indonesianMatches, ...mapped],
            providerMode: 'live_usda',
          };
        }

        if (res.status === 429) {
          console.warn('[USDAProvider] USDA API Rate limit exceeded. Falling back to verified dataset.');
          return {
            results: searchVerifiedFoods(trimmed),
            providerMode: 'verified_dataset',
            message: 'USDA API rate limit reached. Displaying verified food composition database.',
          };
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        console.warn('[USDAProvider] USDA request failed, using verified database:', err);
      }
    }

    // Fallback to verified food composition dataset
    return {
      results: searchVerifiedFoods(trimmed),
      providerMode: 'verified_dataset',
      message: this.hasApiKey()
        ? 'Live service unreachable. Displaying verified food composition records.'
        : 'USDA_FDC_API_KEY not configured. Displaying verified food composition records.',
    };
  }

  /**
   * Get full food nutrient details.
   */
  async getFoodDetail(id: string, signal?: AbortSignal): Promise<{
    food: FoodDetail | null;
    providerMode: 'live_usda' | 'verified_dataset';
    message?: string;
  }> {
    // Check if ID is in verified DB (e.g. tkpi-* or usda-*)
    const verified = getVerifiedFoodById(id);
    if (verified) {
      return {
        food: verified,
        providerMode: 'verified_dataset',
      };
    }

    // If numerical FDC ID and API key exists, fetch live USDA
    if (this.hasApiKey() && /^\d+$/.test(id)) {
      try {
        const url = `${USDA_BASE_URL}/food/${id}?api_key=${encodeURIComponent(this.apiKey!)}`;
        const res = await fetch(url, {
          signal,
          headers: { Accept: 'application/json' },
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const data: USDAFoodDetailItem = await res.json();
          const nutrients = this.normalizeUSDANutrients(data.foodNutrients || []);

          const detail: FoodDetail = {
            id: String(data.fdcId),
            name: data.description,
            description: `USDA FoodData Central ID: ${data.fdcId}`,
            provider: 'usda',
            brandOwner: data.brandOwner,
            referenceBasisGrams: 100, // USDA Foundation & SR Legacy nutrient data are strictly per 100g
            nutrientsPerReference: nutrients,
          };

          return {
            food: detail,
            providerMode: 'live_usda',
          };
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        console.warn(`[USDAProvider] Failed to fetch food ${id}:`, err);
      }
    }

    return {
      food: null,
      providerMode: this.hasApiKey() ? 'live_usda' : 'verified_dataset',
      message: `Food item with ID ${id} could not be retrieved.`,
    };
  }

  /**
   * Normalizes USDA nutrient items to CanonicalNutrients.
   * Explicitly sets isAvailable: false and value: null when missing.
   */
  public normalizeUSDANutrients(
    nutrientsList: {
      nutrient: { id: number; number: string; name: string; unitName: string };
      amount: number;
    }[]
  ): CanonicalNutrients {
    const findNutrient = (ids: number[], namePatterns: RegExp[], expectedUnit: string): NutrientValue => {
      for (const item of nutrientsList) {
        const idMatch = ids.includes(item.nutrient.id);
        const nameMatch = namePatterns.some((pattern) => pattern.test(item.nutrient.name));

        if (idMatch || nameMatch) {
          if (typeof item.amount === 'number' && Number.isFinite(item.amount)) {
            // Check unit match (e.g. kJ to kcal if necessary)
            let val = item.amount;
            const unit = item.nutrient.unitName?.toLowerCase() || '';

            if (expectedUnit === 'kcal' && unit === 'kj') {
              val = val / 4.184;
            } else if (expectedUnit === 'g' && unit === 'mg') {
              val = val / 1000;
            } else if (expectedUnit === 'mg' && unit === 'g') {
              val = val * 1000;
            }

            return {
              value: val,
              unit: expectedUnit,
              isAvailable: true,
            };
          }
        }
      }

      return {
        value: null,
        unit: expectedUnit,
        isAvailable: false,
      };
    };

    return {
      calories: findNutrient([1008, 2047, 2048], [/Energy/i], 'kcal'),
      protein: findNutrient([1003], [/Protein/i], 'g'),
      fat: findNutrient([1004], [/Total lipid/i, /Total fat/i], 'g'),
      carbs: findNutrient([1005], [/Carbohydrate/i], 'g'),
      fiber: findNutrient([1079], [/Fiber/i], 'g'),
      sugar: findNutrient([2000, 1063], [/Sugar/i], 'g'),
      sodium: findNutrient([1093], [/Sodium/i], 'mg'),
      cholesterol: findNutrient([1253], [/Cholesterol/i], 'mg'),
      caffeine: findNutrient([1057], [/Caffeine/i], 'mg'),
    };
  }
}

export const usdaProvider = new USDAProviderAdapter();
