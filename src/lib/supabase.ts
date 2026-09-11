import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Recipe, Ingredient } from './types';
import { DEFAULT_INGREDIENTS, DEFAULT_RECIPES } from './defaultData';

const getEnvOrStorage = (key: string): string => {
  if (typeof window !== 'undefined') {
    const localVal = localStorage.getItem(key);
    if (localVal) return localVal;
  }
  if (key === 'SUPABASE_URL') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  if (key === 'SUPABASE_ANON_KEY') {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  return '';
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const url = getEnvOrStorage('SUPABASE_URL');
  const anonKey = getEnvOrStorage('SUPABASE_ANON_KEY');

  if (url && anonKey && url.startsWith('http')) {
    try {
      return createClient(url, anonKey);
    } catch {
      return null;
    }
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => {
  const url = getEnvOrStorage('SUPABASE_URL');
  const anonKey = getEnvOrStorage('SUPABASE_ANON_KEY');
  return Boolean(url && anonKey && url.startsWith('http'));
};

/**
 * ดึงข้อมูลวัตถุดิบทั้งหมด (จาก Supabase หรือ Local Fallback)
 */
export async function fetchIngredients(): Promise<Ingredient[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('ingredients').select('*');
      if (!error && data && data.length > 0) {
        return data as Ingredient[];
      }
    } catch (e) {
      console.warn('Supabase fetch error, fallback to local data:', e);
    }
  }
  return DEFAULT_INGREDIENTS;
}

/**
 * ดึงข้อมูลสูตรอาหารทั้งหมด (จาก Supabase หรือ Local Fallback)
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: recipesData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            ingredient_id,
            amount,
            is_optional
          )
        `);

      if (!recipeError && recipesData && recipesData.length > 0) {
        return recipesData.map((r: any) => ({
          ...r,
          ingredients: r.recipe_ingredients || [],
        })) as Recipe[];
      }
    } catch (e) {
      console.warn('Supabase fetch error, fallback to local data:', e);
    }
  }
  return DEFAULT_RECIPES;
}

/**
 * บันทึกรายการวัตถุดิบตู้เย็นผู้ใช้
 */
export async function syncUserFridge(
  selectedIds: string[],
  stapleIds: string[]
): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kinaraidee_fridge', JSON.stringify(selectedIds));
    localStorage.setItem('kinaraidee_staples', JSON.stringify(stapleIds));
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // สามารถบันทึกลง table user_fridge ได้หากต้องการ
      const records = selectedIds.map(id => ({
        user_id: 'guest',
        ingredient_id: id,
        is_staple: stapleIds.includes(id),
      }));
      await supabase.from('user_fridge').upsert(records);
    } catch (e) {
      console.warn('Could not sync fridge to Supabase:', e);
    }
  }
}
