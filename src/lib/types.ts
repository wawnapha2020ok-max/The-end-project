export type IngredientCategory = 'meat' | 'veggie' | 'seasoning' | 'staple' | 'carb' | 'other';

export type RecipeCategory = 'rice' | 'noodle' | 'soup' | 'stir_fry' | 'fried' | 'clean';

export interface Ingredient {
  id: string;
  name: string;
  name_en?: string;
  category: IngredientCategory;
  icon: string;
  is_staple?: boolean; // วัตถุดิบติดตู้เย็นไว้เสมอ (จำค่าอัตโนมัติ)
  cal_per_100g?: number;
  is_custom?: boolean; // เพิ่มโดยผู้ใช้เอง
}

export interface RecipeIngredient {
  ingredient_id: string;
  amount: string;
  is_optional?: boolean;
  ingredient?: Ingredient;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  cooking_time_minutes: number;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'เชฟมือโปร';
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  image_url: string;
  video_url?: string;
  tags: string[];
  steps: string[];
  ingredients: RecipeIngredient[];
}

export interface MatchResult {
  recipe: Recipe;
  matchPercentage: number; // 0 - 100
  isFullMatch: boolean; // มีวัตถุดิบหลักครบ 100%
  availableIngredients: { id: string; name: string; icon: string }[];
  missingIngredients: { id: string; name: string; icon: string; isOptional?: boolean; amount?: string }[];
  missingRequiredCount: number;
}

export interface UnlockSuggestion {
  missingIngredient: { id: string; name: string; icon: string };
  unlockedRecipe: Recipe;
  benefitText: string;
}

export interface FilterOptions {
  category: string; // 'all' or specific RecipeCategory
  matchMode: 'all' | 'exact' | 'missing1or2';
  timeFilter: 'all' | 'quick' | 'dedicated'; // quick <= 15 mins, dedicated > 15 mins
  calorieFilter: 'all' | 'low' | 'medium'; // low < 250, medium 250-550
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLog {
  id: string;
  recipeTitle: string;
  recipeId: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  mealType: MealType;
  loggedAt: string;
  imageUrl?: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  goalCalories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meals: MealLog[];
}
