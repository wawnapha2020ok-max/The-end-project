import { Recipe, MatchResult, UnlockSuggestion, FilterOptions, Ingredient } from './types';

/**
 * คำนวณความเข้ากันได้ของสูตรอาหารกับวัตถุดิบที่ผู้ใช้เลือกในตู้เย็น
 */
export function calculateMatch(
  recipe: Recipe,
  selectedIngredientIds: Set<string>,
  ingredientsMap: Map<string, Ingredient>
): MatchResult {
  const availableIngredients: MatchResult['availableIngredients'] = [];
  const missingIngredients: MatchResult['missingIngredients'] = [];

  let requiredCount = 0;
  let requiredMatched = 0;

  for (const item of recipe.ingredients) {
    const ingDetails = ingredientsMap.get(item.ingredient_id) || {
      id: item.ingredient_id,
      name: item.ingredient_id,
      icon: '🍲',
      category: 'other' as const,
    };

    // ตรวจสอบว่ามีวัตถุดิบนี้ในตู้เย็นหรือไม่ (รองรับทั้ง ID ตรง, ชื่อตรง, และวัตถุดิบที่ผู้ใช้พิมพ์เอง)
    let hasItem = selectedIngredientIds.has(item.ingredient_id);

    if (!hasItem) {
      const targetName = ingDetails.name.toLowerCase();
      for (const selId of selectedIngredientIds) {
        const selIng = ingredientsMap.get(selId);
        if (!selIng) continue;
        const selName = selIng.name.toLowerCase();

        // ตรวจชื่อตรงกัน หรือมีส่วนประกอบของชื่อ
        if (selName === targetName || targetName.includes(selName) || selName.includes(targetName)) {
          hasItem = true;
          break;
        }

        // ตรวจคำพ้องความหมายอาหารไทย
        if (
          (targetName.includes('กะเพรา') && selName.includes('กะเพรา')) ||
          (targetName.includes('หมูสับ') && (selName.includes('หมูสับ') || selName === 'หมู')) ||
          (targetName.includes('หมูชิ้น') && selName.includes('หมู')) ||
          (targetName.includes('หมูกรอบ') && selName.includes('หมูกรอบ')) ||
          (targetName.includes('ไก่') && selName.includes('ไก่')) ||
          (targetName.includes('กุ้ง') && selName.includes('กุ้ง')) ||
          (targetName.includes('หมึก') && selName.includes('หมึก')) ||
          (targetName.includes('ไข่') && selName.includes('ไข่')) ||
          (targetName.includes('ผักกาด') && selName.includes('ผักกาด')) ||
          (targetName.includes('คะน้า') && selName.includes('คะน้า')) ||
          (targetName.includes('กะหล่ำ') && selName.includes('กะหล่ำ')) ||
          (targetName.includes('ผักบุ้ง') && selName.includes('ผักบุ้ง')) ||
          (targetName.includes('เห็ด') && selName.includes('เห็ด')) ||
          (targetName.includes('เต้าหู้') && selName.includes('เต้าหู้')) ||
          (targetName.includes('มาม่า') && (selName.includes('มาม่า') || selName.includes('บะหมี่'))) ||
          (targetName.includes('ข้าว') && selName.includes('ข้าว'))
        ) {
          hasItem = true;
          break;
        }
      }
    }

    if (hasItem) {
      availableIngredients.push({
        id: item.ingredient_id,
        name: ingDetails.name,
        icon: ingDetails.icon,
      });
      if (!item.is_optional) {
        requiredMatched++;
      }
    } else {
      missingIngredients.push({
        id: item.ingredient_id,
        name: ingDetails.name,
        icon: ingDetails.icon,
        isOptional: item.is_optional,
        amount: item.amount,
      });
    }

    if (!item.is_optional) {
      requiredCount++;
    }
  }

  const missingRequiredCount = requiredCount - requiredMatched;
  const matchPercentage = requiredCount > 0 
    ? Math.round((requiredMatched / requiredCount) * 100) 
    : 100;

  return {
    recipe,
    matchPercentage,
    isFullMatch: missingRequiredCount === 0,
    availableIngredients,
    missingIngredients,
    missingRequiredCount,
  };
}

/**
 * กรองและจัดอันดับเมนูอาหารตามเงื่อนไข
 */
export function filterAndRankRecipes(
  recipes: Recipe[],
  selectedIngredientIds: Set<string>,
  filters: FilterOptions,
  ingredientsMap: Map<string, Ingredient>
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const recipe of recipes) {
    // กรองตามหมวดหมู่
    if (filters.category !== 'all' && recipe.category !== filters.category) {
      continue;
    }

    // กรองตามเวลาทำ
    if (filters.timeFilter === 'quick' && recipe.cooking_time_minutes > 15) {
      continue;
    }
    if (filters.timeFilter === 'dedicated' && recipe.cooking_time_minutes <= 15) {
      continue;
    }

    // กรองตามแคลอรี
    if (filters.calorieFilter === 'low' && recipe.calories >= 250) {
      continue;
    }
    if (filters.calorieFilter === 'medium' && (recipe.calories < 250 || recipe.calories > 550)) {
      continue;
    }

    const match = calculateMatch(recipe, selectedIngredientIds, ingredientsMap);

    // กรองตามโหมดความพร้อมของวัตถุดิบ
    if (filters.matchMode === 'exact' && !match.isFullMatch) {
      continue;
    }
    if (filters.matchMode === 'missing1or2' && match.missingRequiredCount > 2) {
      continue;
    }

    results.push(match);
  }

  // จัดอันดับ: เปอร์เซ็นต์ตรงมากสุด -> ขาดน้อยสุด -> เมนูเวลาทำน้อย
  results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    if (a.missingRequiredCount !== b.missingRequiredCount) {
      return a.missingRequiredCount - b.missingRequiredCount;
    }
    return a.recipe.cooking_time_minutes - b.recipe.cooking_time_minutes;
  });

  return results;
}

/**
 * คำนวณระบบ 'เพิ่มอีก 1 อย่าง เพื่อปลดล็อกเมนูใหม่' (Unlock More Dishes)
 * ค้นหาว่าการมีวัตถุดิบเพิ่มแค่ 1 ชิ้น จะทำให้ทำเมนูอะไรเพิ่มได้บ้าง
 */
export function findUnlockSuggestions(
  recipes: Recipe[],
  selectedIngredientIds: Set<string>,
  ingredientsMap: Map<string, Ingredient>
): UnlockSuggestion[] {
  const suggestions: UnlockSuggestion[] = [];
  const seenRecipes = new Set<string>();

  for (const recipe of recipes) {
    const match = calculateMatch(recipe, selectedIngredientIds, ingredientsMap);

    // ต้องเป็นเมนูที่ขาดวัตถุดิบหลัก 'เพียง 1 อย่าง' เท่านั้น
    if (match.missingRequiredCount === 1 && !seenRecipes.has(recipe.id)) {
      const missingItem = match.missingIngredients.find(m => !m.isOptional);
      if (missingItem) {
        suggestions.push({
          missingIngredient: {
            id: missingItem.id,
            name: missingItem.name,
            icon: missingItem.icon,
          },
          unlockedRecipe: recipe,
          benefitText: `แค่เพิ่ม "${missingItem.name}" คุณจะทำเมนู "${recipe.title}" ได้ทันที!`,
        });
        seenRecipes.add(recipe.id);
      }
    }
  }

  return suggestions;
}
