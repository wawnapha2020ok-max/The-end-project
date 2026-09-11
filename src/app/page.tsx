'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import FridgeSection from '../components/FridgeSection';
import FilterBar from '../components/FilterBar';
import RandomizerHero from '../components/RandomizerHero';
import UnlockBanner from '../components/UnlockBanner';
import AllMatchesList from '../components/AllMatchesList';
import ResultModal from '../components/ResultModal';
import SupabaseModal from '../components/SupabaseModal';
import SpinningWheelModal from '../components/SpinningWheelModal';
import DailyCalorieDrawer from '../components/DailyCalorieDrawer';

import { Ingredient, Recipe, MatchResult, FilterOptions, IngredientCategory, MealLog, MealType } from '../lib/types';
import { DEFAULT_INGREDIENTS, DEFAULT_RECIPES } from '../lib/defaultData';
import { filterAndRankRecipes, findUnlockSuggestions } from '../lib/matcher';
import { fetchIngredients, fetchRecipes, syncUserFridge, isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';
import { generateChefRecipe, CookingStyle } from '../lib/chefGenerator';

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(DEFAULT_RECIPES);

  // User Fridge state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [stapleIds, setStapleIds] = useState<Set<string>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    matchMode: 'all',
    timeFilter: 'all',
    calorieFilter: 'all',
  });

  // Modal & Interactive states
  const [activeMatch, setActiveMatch] = useState<MatchResult | null>(null);
  const [isCustomCreated, setIsCustomCreated] = useState<boolean>(false);
  const [chefTip, setChefTip] = useState<string | undefined>(undefined);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());

  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Add-on Features: Daily Calorie Tracker & Spinning Wheel
  const [isWheelModalOpen, setIsWheelModalOpen] = useState<boolean>(false);
  const [isCalorieDrawerOpen, setIsCalorieDrawerOpen] = useState<boolean>(false);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load & Setup
  useEffect(() => {
    setIsSupabaseLive(isSupabaseConfigured());

    const loadData = async () => {
      let allIngredients = await fetchIngredients();
      const recs = await fetchRecipes();

      // Check saved custom recipes in localStorage
      let combinedRecipes = recs;
      if (typeof window !== 'undefined') {
        const savedCustomRecipes = localStorage.getItem('kinaraidee_custom_recipes');
        if (savedCustomRecipes) {
          try {
            const parsedCustom = JSON.parse(savedCustomRecipes);
            if (Array.isArray(parsedCustom)) {
              combinedRecipes = [...parsedCustom, ...recs];
            }
          } catch {
            // fallback
          }
        }

        // Load daily meal logs & goal
        const savedMeals = localStorage.getItem('kinaraidee_meal_logs');
        if (savedMeals) {
          try {
            const parsedMeals = JSON.parse(savedMeals);
            if (Array.isArray(parsedMeals)) {
              setTodayMeals(parsedMeals);
            }
          } catch {
            // fallback
          }
        }

        const savedGoal = localStorage.getItem('kinaraidee_calorie_goal');
        if (savedGoal) {
          const parsed = parseInt(savedGoal, 10);
          if (parsed && !isNaN(parsed)) setCalorieGoal(parsed);
        }

        // Load custom ingredients created by user
        const savedCustomIngredients = localStorage.getItem('kinaraidee_custom_ingredients');
        if (savedCustomIngredients) {
          try {
            const parsedCustom = JSON.parse(savedCustomIngredients);
            if (Array.isArray(parsedCustom)) {
              const existingIds = new Set(allIngredients.map(i => i.id));
              const validCustom = parsedCustom.filter(c => c && c.id && !existingIds.has(c.id));
              allIngredients = [...validCustom, ...allIngredients];
            }
          } catch (e) {
            console.error('Failed to load custom ingredients:', e);
          }
        }
      }

      setIngredients(allIngredients);
      setRecipes(combinedRecipes);

      // Load saved fridge from LocalStorage
      if (typeof window !== 'undefined') {
        const savedFridge = localStorage.getItem('kinaraidee_fridge');
        const savedStaples = localStorage.getItem('kinaraidee_staples');

        let loadedStaples: string[] = [];
        if (savedStaples) {
          try {
            const parsed = JSON.parse(savedStaples);
            if (Array.isArray(parsed)) {
              loadedStaples = parsed;
            }
          } catch {
            // fallback
          }
        }
        if (loadedStaples.length === 0) {
          loadedStaples = allIngredients.filter(i => i.is_staple).map(i => i.id);
        }
        setStapleIds(new Set(loadedStaples));

        let loadedFridge: string[] = [];
        if (savedFridge) {
          try {
            const parsed = JSON.parse(savedFridge);
            if (Array.isArray(parsed)) {
              loadedFridge = parsed;
            }
          } catch {
            // fallback
          }
        }
        if (loadedFridge.length === 0) {
          loadedFridge = ['pork_minced', 'chinese_cabbage', 'egg', 'garlic', 'soy_sauce', 'bouillon_cube'];
        }
        setSelectedIds(new Set(loadedFridge));
      }
    };

    loadData();
  }, []);

  // Map for fast ingredient lookup
  const ingredientsMap = useMemo(() => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach(i => map.set(i.id, i));
    return map;
  }, [ingredients]);

  // Sync fridge with storage
  useEffect(() => {
    if (selectedIds.size > 0 || stapleIds.size > 0) {
      syncUserFridge(Array.from(selectedIds), Array.from(stapleIds));
    }
  }, [selectedIds, stapleIds]);

  // Sync meals with storage
  const saveMealsToStorage = (meals: MealLog[]) => {
    setTodayMeals(meals);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinaraidee_meal_logs', JSON.stringify(meals));
    }
  };

  const handleUpdateCalorieGoal = (newGoal: number) => {
    setCalorieGoal(newGoal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kinaraidee_calorie_goal', newGoal.toString());
    }
    showToast(`🎯 ปรับเป้าหมายแคลอรี่เป็น ${newGoal} kcal เรียบร้อย`);
  };

  // 2. Computed Matches & Unlock Suggestions
  const matchingResults = useMemo(() => {
    return filterAndRankRecipes(recipes, selectedIds, filters, ingredientsMap);
  }, [recipes, selectedIds, filters, ingredientsMap]);

  const unlockSuggestions = useMemo(() => {
    return findUnlockSuggestions(recipes, selectedIds, ingredientsMap);
  }, [recipes, selectedIds, ingredientsMap]);

  // Total calories consumed today
  const todayCaloriesTotal = useMemo(() => {
    return todayMeals.reduce((acc, m) => acc + m.calories, 0);
  }, [todayMeals]);

  // 3. User Handlers
  const handleToggleIngredient = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleStaple = (id: string) => {
    setStapleIds(prev => {
      const next = new Set(prev);
      const isNowStaple = !next.has(id);
      if (isNowStaple) {
        next.add(id);
        setSelectedIds(f => new Set(f).add(id));
        showToast('⭐ บันทึกเป็นวัตถุดิบติดตู้เย็นเสมอเรียบร้อย');
      } else {
        next.delete(id);
        showToast('ยกเลิกวัตถุดิบติดตู้เย็นเสมอ');
      }
      return next;
    });
  };

  const handleAddCustomIngredient = (
    name: string,
    category: IngredientCategory,
    icon?: string,
    cal?: number
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();

    // 1. ตรวจสอบว่าชื่อตรงกับวัตถุดิบที่มีอยู่แล้วหรือไม่ (Exact Match)
    const existing = ingredients.find(
      i => i.name.toLowerCase() === lower ||
           (i.name_en && i.name_en.toLowerCase() === lower)
    );

    if (existing) {
      setSelectedIds(prev => new Set(prev).add(existing.id));
      showToast(`✅ วัตถุดิบ "${existing.name}" มีอยู่ในระบบแล้ว — นำใส่ตู้เย็นให้เรียบร้อย!`);
      return;
    }

    // 2. ตรวจคำพ้องความหมายภาษาไทยเพื่อเชื่อมกับสูตรมาตรฐานอัตโนมัติ
    const synonymMatch = ingredients.find(i => {
      if (lower.includes('กะเพรา') && i.id === 'holy_basil') return true;
      if ((lower === 'หมูสับ' || lower === 'หมูบด' || lower === 'เนื้อหมู') && i.id === 'pork_minced') return true;
      if ((lower === 'หมูชิ้น' || lower === 'หมูสไลซ์') && i.id === 'pork_sliced') return true;
      if (lower.includes('หมูกรอบ') && i.id === 'crispy_pork') return true;
      if ((lower === 'ไข่' || lower === 'ไข่ไก่') && i.id === 'egg') return true;
      if (lower.includes('ผักกาด') && i.id === 'chinese_cabbage') return true;
      if (lower.includes('คะน้า') && i.id === 'chinese_kale') return true;
      if (lower.includes('กะหล่ำ') && i.id === 'cabbage') return true;
      if (lower.includes('ผักบุ้ง') && i.id === 'morning_glory') return true;
      if (lower.includes('กุ้ง') && i.id === 'shrimp') return true;
      if (lower.includes('หมึก') && i.id === 'squid') return true;
      if (lower.includes('มาม่า') && i.id === 'instant_noodles') return true;
      return false;
    });

    if (synonymMatch) {
      setSelectedIds(prev => new Set(prev).add(synonymMatch.id));
      showToast(`✅ ตรวจพบ "${synonymMatch.name}" — นำใส่ตู้เย็นให้เรียบร้อย!`);
      return;
    }

    // 3. สร้างวัตถุดิบใหม่ บันทึกลง State และ LocalStorage
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const iconMap: Record<IngredientCategory, string> = {
      meat: '🥩',
      veggie: '🥬',
      seasoning: '🧂',
      carb: '🍚',
      staple: '🥚',
      other: '🍱',
    };

    const newIng: Ingredient = {
      id: newId,
      name: trimmed,
      category,
      icon: icon || iconMap[category] || '🍱',
      is_custom: true,
      cal_per_100g: cal || (category === 'meat' ? 220 : category === 'veggie' ? 35 : 100),
    };

    setIngredients(prev => {
      const next = [newIng, ...prev];
      if (typeof window !== 'undefined') {
        const customOnly = next.filter(i => i.is_custom);
        localStorage.setItem('kinaraidee_custom_ingredients', JSON.stringify(customOnly));
      }
      return next;
    });

    setSelectedIds(prev => new Set(prev).add(newId));
    showToast(`🎉 เพิ่ม "${trimmed}" เข้าตู้เย็นเรียบร้อย!`);
  };

  const handleDeleteCustomIngredient = (id: string) => {
    setIngredients(prev => {
      const next = prev.filter(i => i.id !== id);
      if (typeof window !== 'undefined') {
        const customOnly = next.filter(i => i.is_custom);
        localStorage.setItem('kinaraidee_custom_ingredients', JSON.stringify(customOnly));
      }
      return next;
    });
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('🗑️ ลบวัตถุดิบเรียบร้อย');
  };

  const handleClearFridge = () => {
    setSelectedIds(new Set());
    showToast('ล้างตู้เย็นเรียบร้อย');
  };

  const handleSelectAllStaples = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      stapleIds.forEach(id => next.add(id));
      return next;
    });
    showToast('ติ๊กเลือกวัตถุดิบที่มีติดตู้เย็นเสมอทั้งหมดแล้ว');
  };

  // Preset 1: หมูสับ + ผักกาดขาว
  const handleApplyPresetScenario = () => {
    const preset = new Set([
      'pork_minced',
      'chinese_cabbage',
      'garlic',
      'soy_sauce',
      'bouillon_cube',
      'pepper',
    ]);
    setSelectedIds(preset);
    showToast('✨ เลือกวัตถุดิบจำลอง: "หมูสับ + ผักกาดขาว + เครื่องปรุง" เรียบร้อย!');
  };

  // Preset 2: มีไข่ + หมูสับ (ขาดกะเพรา) ตามโจทย์ของผู้ใช้!
  const handleSimulatePorkEggScenario = () => {
    const preset = new Set([
      'pork_minced',
      'egg',
      'garlic',
      'chili',
      'oyster_sauce',
      'fish_sauce',
      'steamed_rice',
    ]);
    // explicitly NOT adding 'holy_basil'
    setSelectedIds(preset);
    showToast('✨ จำลอง: มีไข่ไก่ + หมูสับ (ระบบจะแนะนำ "ผัดกะเพราหมูสับไข่ดาว" ขาดแค่ใบกะเพรา)');
  };

  // 4. Randomizer Logic (สุ่มเมนูยอดนิยม)
  const handleRandomize = useCallback(() => {
    if (matchingResults.length === 0) {
      showToast('⚠️ ไม่มีเมนูที่ตรงกับเงื่อนไข ลองปรับตัวกรองดูนะครับ');
      return;
    }

    setIsRolling(true);

    setTimeout(() => {
      const topCandidates = matchingResults.slice(0, Math.min(6, matchingResults.length));
      const randomIndex = Math.floor(Math.random() * topCandidates.length);
      const chosen = topCandidates[randomIndex];

      setIsRolling(false);
      setIsCustomCreated(false);
      setChefTip(undefined);
      setActiveMatch(chosen);
    }, 600);
  }, [matchingResults]);

  // 5. Smart Chef Generator (เชฟคิดค้นเมนูใหม่จากของในตู้)
  const handleGenerateChefRecipe = (cookingStyle: CookingStyle) => {
    if (selectedIds.size === 0) {
      showToast('⚠️ กรุณาเลือกวัตถุดิบในตู้เย็นอย่างน้อย 1 อย่าง');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const selectedIngs = Array.from(selectedIds)
        .map(id => ingredientsMap.get(id))
        .filter((i): i is Ingredient => Boolean(i));

      const generated = generateChefRecipe(selectedIngs, cookingStyle);

      const customMatch: MatchResult = {
        recipe: generated.recipe,
        matchPercentage: 100,
        isFullMatch: true,
        availableIngredients: selectedIngs.map(i => ({ id: i.id, name: i.name, icon: i.icon })),
        missingIngredients: [],
        missingRequiredCount: 0,
      };

      setIsGenerating(false);
      setIsCustomCreated(true);
      setChefTip(generated.chefTip);
      setActiveMatch(customMatch);
    }, 700);
  };

  // 6. Save Custom Recipe
  const handleSaveCustomRecipe = async (recipe: Recipe) => {
    setRecipes(prev => [recipe, ...prev]);
    setSavedRecipeIds(prev => new Set(prev).add(recipe.id));

    if (typeof window !== 'undefined') {
      try {
        const savedCustom = localStorage.getItem('kinaraidee_custom_recipes');
        const list: Recipe[] = savedCustom ? JSON.parse(savedCustom) : [];
        list.unshift(recipe);
        localStorage.setItem('kinaraidee_custom_recipes', JSON.stringify(list));
      } catch {
        // fallback
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('recipes').insert([{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          cooking_time_minutes: recipe.cooking_time_minutes,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          protein_g: recipe.protein_g,
          carbs_g: recipe.carbs_g,
          fat_g: recipe.fat_g,
          image_url: recipe.image_url,
          video_url: recipe.video_url,
          tags: recipe.tags,
          steps: recipe.steps,
        }]);
      } catch (e) {
        console.warn('Could not save custom recipe to Supabase:', e);
      }
    }

    showToast(`⭐ บันทึกเมนู "${recipe.title}" เข้าคลังสูตรอาหารของคุณเรียบร้อย!`);
  };

  // 7. Meal Logging (บันทึกเมนูนี้ที่กินไป)
  const handleLogMeal = (recipe: Recipe, mealType: MealType) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    const newLog: MealLog = {
      id: `meal_${Date.now()}`,
      recipeTitle: recipe.title,
      recipeId: recipe.id,
      calories: recipe.calories,
      protein_g: recipe.protein_g,
      carbs_g: recipe.carbs_g,
      fat_g: recipe.fat_g,
      mealType,
      loggedAt: timeStr,
      imageUrl: recipe.image_url,
    };

    const updated = [newLog, ...todayMeals];
    saveMealsToStorage(updated);
    showToast(`🍽️ บันทึก "${recipe.title}" (+${recipe.calories} kcal) เข้าสู่ยอดวันนี้สำเร็จ!`);
  };

  const handleDeleteMeal = (id: string) => {
    const updated = todayMeals.filter(m => m.id !== id);
    saveMealsToStorage(updated);
    showToast('ลบรายการมื้ออาหารเรียบร้อย');
  };

  const handleClearDayMeals = () => {
    saveMealsToStorage([]);
    showToast('ล้างประวัติการกินวันนี้เรียบร้อย');
  };

  // Reroll (ยังไม่โดนใจ สุ่มใหม่!)
  const handleReroll = () => {
    if (isCustomCreated) {
      handleGenerateChefRecipe('auto');
      return;
    }

    if (matchingResults.length <= 1) {
      showToast('มีเมนูที่เข้าเงื่อนไขเพียง 1 เมนูในขณะนี้');
      return;
    }
    const currentId = activeMatch?.recipe.id;
    const pool = matchingResults.filter(m => m.recipe.id !== currentId);
    const randomIndex = Math.floor(Math.random() * pool.length);
    setActiveMatch(pool[randomIndex]);
  };

  // Cook Done (ตัดสต็อกวัตถุดิบ)
  const handleCookDone = (recipe: Recipe) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      recipe.ingredients.forEach(item => {
        if (!stapleIds.has(item.ingredient_id)) {
          next.delete(item.ingredient_id);
        }
      });
      return next;
    });
    setActiveMatch(null);
    showToast(`🎉 อิ่มอร่อยกับ "${recipe.title}"! ระบบตัดสต็อกวัตถุดิบเรียบร้อย`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header with Calorie Tracker & Spinning Wheel shortcut */}
      <Header
        fridgeCount={selectedIds.size}
        stapleCount={stapleIds.size}
        todayCalories={todayCaloriesTotal}
        calorieGoal={calorieGoal}
        isSupabase={isSupabaseLive}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenCalorieDrawer={() => setIsCalorieDrawerOpen(true)}
        onOpenSpinningWheel={() => setIsWheelModalOpen(true)}
      />

      {/* Main Container */}
      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '24px 20px 60px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}>
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="animate-pop-in"
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: '#1E293B',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 70,
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Fridge Inventory */}
        <FridgeSection
          ingredients={ingredients}
          selectedIds={selectedIds}
          stapleIds={stapleIds}
          onToggleIngredient={handleToggleIngredient}
          onToggleStaple={handleToggleStaple}
          onAddCustomIngredient={handleAddCustomIngredient}
          onDeleteCustomIngredient={handleDeleteCustomIngredient}
          onClearFridge={handleClearFridge}
          onSelectAllStaples={handleSelectAllStaples}
          onApplyPresetScenario={handleApplyPresetScenario}
        />

        {/* 2. Filter Bar */}
        <FilterBar
          filters={filters}
          onChangeFilters={setFilters}
          eligibleCount={matchingResults.length}
        />

        {/* 3. Hero Actions: Dual Button (ให้เชฟสร้างเมนูใหม่ + สุ่มจากเมนูยอดนิยม) */}
        <RandomizerHero
          onRandomize={handleRandomize}
          onGenerateChefRecipe={handleGenerateChefRecipe}
          eligibleCount={matchingResults.length}
          isRolling={isRolling}
          isGenerating={isGenerating}
          selectedCount={selectedIds.size}
        />

        {/* 4. Add-on 1: Missing 1 Ingredient Banner (ขาดอีกแค่อย่างเดียว) */}
        <UnlockBanner
          suggestions={unlockSuggestions}
          onAddIngredient={(id) => {
            setSelectedIds(prev => new Set(prev).add(id));
            showToast('✅ หยิบวัตถุดิบใส่ตู้เย็นเรียบร้อย!');
          }}
          onSelectRecipe={(r) => {
            const match = matchingResults.find(m => m.recipe.id === r.id) || {
              recipe: r,
              matchPercentage: 80,
              isFullMatch: false,
              availableIngredients: [],
              missingIngredients: [],
              missingRequiredCount: 1,
            };
            setIsCustomCreated(false);
            setChefTip(undefined);
            setActiveMatch(match);
          }}
          onSimulatePorkEggScenario={handleSimulatePorkEggScenario}
        />

        {/* 5. All Matches Grid */}
        <AllMatchesList
          matches={matchingResults}
          onSelectMatch={(m) => {
            setIsCustomCreated(false);
            setChefTip(undefined);
            setActiveMatch(m);
          }}
        />
      </main>

      {/* Result Modal with Calorie Logger */}
      {activeMatch && (
        <ResultModal
          match={activeMatch}
          onClose={() => setActiveMatch(null)}
          onReroll={handleReroll}
          onCookDone={handleCookDone}
          canReroll={isCustomCreated || matchingResults.length > 1}
          isCustomCreated={isCustomCreated}
          chefTip={chefTip}
          onSaveRecipe={handleSaveCustomRecipe}
          isSaved={savedRecipeIds.has(activeMatch.recipe.id)}
          onLogMeal={handleLogMeal}
          isMealLogged={todayMeals.some(m => m.recipeId === activeMatch.recipe.id)}
          onAddIngredientToFridge={(id) => {
            setSelectedIds(prev => new Set(prev).add(id));
            showToast('✅ เพิ่มวัตถุดิบเข้าตู้เย็นเรียบร้อย!');
          }}
        />
      )}

      {/* Add-on 2: Spinning Wheel Modal (วงล้อเสี่ยงทายประจำวัน) */}
      <SpinningWheelModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        candidates={matchingResults}
        onSelectWinner={(winner) => {
          setIsCustomCreated(false);
          setChefTip(undefined);
          setActiveMatch(winner);
        }}
      />

      {/* Add-on 3: Daily Calorie Drawer (สมุดบันทึกแคลอรี่รายวัน) */}
      <DailyCalorieDrawer
        isOpen={isCalorieDrawerOpen}
        onClose={() => setIsCalorieDrawerOpen(false)}
        meals={todayMeals}
        onDeleteMeal={handleDeleteMeal}
        onClearDay={handleClearDayMeals}
        calorieGoal={calorieGoal}
        onUpdateGoal={handleUpdateCalorieGoal}
      />

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => {
          setIsSupabaseLive(isSupabaseConfigured());
          showToast('บันทึกการตั้งค่า Supabase เรียบร้อย');
        }}
      />

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border)',
        background: '#FFFFFF',
        padding: '20px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
      }}>
        <div>
          กินอะไรดี POS • Smart Kitchen, Daily Calorie Diary & Lucky Wheel System
        </div>
        <div style={{ marginTop: 4 }}>
          Ready for <strong>Vercel Deployment</strong> with <strong>Supabase Database</strong>
        </div>
      </footer>
    </div>
  );
}
