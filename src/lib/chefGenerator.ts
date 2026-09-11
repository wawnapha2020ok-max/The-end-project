import { Ingredient, Recipe, RecipeCategory } from './types';

export type CookingStyle = 'auto' | 'soup' | 'stir_fry' | 'fried' | 'clean';

export interface GeneratedRecipeResult {
  recipe: Recipe;
  chefTip: string;
  isCustomCreated: boolean;
}

/**
 * วิเคราะห์และจัดกลุ่มวัตถุดิบเพื่อนำไปสร้างสรรค์เมนู
 */
function categorizeSelected(ingredients: Ingredient[]) {
  const meats: Ingredient[] = [];
  const veggies: Ingredient[] = [];
  const seasonings: Ingredient[] = [];
  const carbs: Ingredient[] = [];
  const eggsAndDairy: Ingredient[] = [];
  const others: Ingredient[] = [];

  for (const ing of ingredients) {
    if (ing.id === 'egg' || ing.name.includes('ไข่')) {
      eggsAndDairy.push(ing);
    } else if (ing.category === 'meat' || ing.name.includes('หมู') || ing.name.includes('ไก่') || ing.name.includes('กุ้ง') || ing.name.includes('ปลา') || ing.name.includes('เนื้อ')) {
      meats.push(ing);
    } else if (ing.category === 'veggie' || ing.name.includes('ผัก') || ing.name.includes('กะเพรา') || ing.name.includes('บุ้ง') || ing.name.includes('คะน้า')) {
      veggies.push(ing);
    } else if (ing.category === 'seasoning') {
      seasonings.push(ing);
    } else if (ing.category === 'carb' || ing.name.includes('ข้าว') || ing.name.includes('เส้น') || ing.name.includes('มาม่า')) {
      carbs.push(ing);
    } else {
      others.push(ing);
    }
  }

  return { meats, veggies, seasonings, carbs, eggsAndDairy, others };
}

/**
 * คำนวณแคลอรีและสารอาหารจากวัตถุดิบจริง
 */
function calculateDynamicNutrition(ingredients: Ingredient[], style: CookingStyle) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const ing of ingredients) {
    const baseCal = ing.cal_per_100g || 100;
    // Estimate portion ~100-150g for meats, ~80g for veggies, etc.
    let portion = 1.0;
    if (ing.category === 'meat') portion = 1.2;
    if (ing.category === 'veggie') portion = 0.8;
    if (ing.category === 'seasoning') portion = 0.15;

    const cals = Math.round(baseCal * portion);
    totalCalories += cals;

    // Macro estimates
    if (ing.category === 'meat' || ing.id === 'egg') {
      totalProtein += Math.round(portion * 18);
      totalFat += Math.round(portion * 10);
    } else if (ing.category === 'carb') {
      totalCarbs += Math.round(portion * 28);
    } else if (ing.category === 'veggie') {
      totalCarbs += Math.round(portion * 4);
      totalProtein += Math.round(portion * 2);
    }
  }

  // Adjustment based on cooking style
  if (style === 'fried') {
    totalCalories += 120; // oil
    totalFat += 14;
  } else if (style === 'stir_fry') {
    totalCalories += 60; // oil
    totalFat += 7;
  } else if (style === 'clean' || style === 'soup') {
    totalCalories += 10;
  }

  // Safety bounds
  if (totalCalories < 150) totalCalories = 180;
  if (totalProtein < 8) totalProtein = 12;

  return {
    calories: totalCalories,
    protein_g: totalProtein,
    carbs_g: Math.max(5, totalCarbs),
    fat_g: Math.max(4, totalFat),
  };
}

/**
 * เชฟอัจฉริยะคิดค้น/สร้างเมนูใหม่จากวัตถุดิบที่มี
 */
export function generateChefRecipe(
  selectedIngredients: Ingredient[],
  chosenStyle: CookingStyle = 'auto',
  customNotes?: string
): GeneratedRecipeResult {
  if (selectedIngredients.length === 0) {
    throw new Error('กรุณาเลือกวัตถุดิบในตู้เย็นอย่างน้อย 1 อย่าง');
  }

  const { meats, veggies, seasonings, carbs, eggsAndDairy, others } = categorizeSelected(selectedIngredients);

  // 1. Determine actual cooking technique
  let effectiveStyle: CookingStyle = chosenStyle;
  if (chosenStyle === 'auto') {
    if (carbs.length > 0 && (carbs[0].name.includes('ข้าว') || carbs[0].name.includes('เส้น'))) {
      effectiveStyle = 'stir_fry';
    } else if (meats.length > 0 && veggies.length > 0) {
      // If we have minced meat and leafy greens -> great for soup or stir-fry
      effectiveStyle = Math.random() > 0.5 ? 'soup' : 'stir_fry';
    } else if (eggsAndDairy.length > 0 && meats.length > 0 && veggies.length === 0) {
      effectiveStyle = 'fried';
    } else {
      effectiveStyle = 'stir_fry';
    }
  }

  // Primary ingredients naming
  const mainMeat = meats[0]?.name || eggsAndDairy[0]?.name || 'โปรตีนสด';
  const mainVeg = veggies[0]?.name || '';
  const secondVeg = veggies[1]?.name || '';
  const hasEgg = eggsAndDairy.length > 0;
  const hasRice = carbs.some(c => c.name.includes('ข้าว'));
  const hasNoodle = carbs.some(c => c.name.includes('เส้น') || c.name.includes('มาม่า'));

  let title = '';
  let description = '';
  let category: RecipeCategory = 'stir_fry';
  let cookingTime = 15;
  let steps: string[] = [];
  let chefTip = '';
  let imageUrl = '';

  // 2. Generate title, steps, and imagery by style
  switch (effectiveStyle) {
    case 'soup':
      category = 'soup';
      cookingTime = 12;
      imageUrl = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80';
      
      if (hasEgg && mainVeg) {
        title = `ต้มจืด${mainMeat}${mainVeg}ไข่น้ำทรงเครื่อง`;
      } else if (mainVeg) {
        title = `แกงจืด${mainVeg}${mainMeat}สูตรซุปหวานธรรมชาติ`;
      } else {
        title = `ซุปน้ำใส${mainMeat}กลมกล่อมหอมกรุ่น`;
      }

      description = `เมนูน้ำซุปร้อนๆ ชื่นใจ ดึงความหวานตามธรรมชาติจาก ${mainMeat} และ ${mainVeg || 'เครื่องปรุงในตู้เย็น'} ซดคล่องคอ สบายท้อง`;

      steps = [
        `เตรียมและล้าง ${mainVeg || 'ผักสด'} ให้สะอาด หั่นเป็นชิ้นพอดีคำ ส่วน ${mainMeat} นำมาปรุงรสด้วยซีอิ๊วขาวและพริกไทยเล็กน้อย`,
        `ตั้งหม้อใส่น้ำสะอาดประมาณ 2-3 ถ้วย ใส่กระเทียมทุบหรือซุปก้อนลงไป ต้มจนน้ำเดือดพล่าน`,
        `ปั้น ${mainMeat} เป็นก้อนกลมหย่อนลงในน้ำเดือด รอจนสุกและลอยตัวขึ้นมา`,
        `ใส่ ${mainVeg || 'ผัก'} ลงไป ปรุงรสด้วยซีอิ๊วขาวและน้ำปลา${hasEgg ? ' แล้วตอกไข่ตีวนเบาๆ ให้เป็นริ้วสวยงาม' : ''} รอผักสลดยกเสิร์ฟได้ทันที`,
      ];

      chefTip = '💡 เคล็ดลับเชฟ: ใส่ผักในขั้นตอนสุดท้ายหลังจากน้ำเดือดจัด เพื่อคงความหวานกรอบและสีเขียวสดชื่น';
      break;

    case 'stir_fry':
      category = 'stir_fry';
      cookingTime = 10;
      imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';

      if (hasRice) {
        title = `ข้าวผัด${mainMeat}${mainVeg ? 'ใส่' + mainVeg : ''}หอมกลิ่นกระทะ`;
        category = 'rice';
        imageUrl = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80';
      } else if (hasNoodle) {
        title = `ผัดเส้น${mainMeat}${mainVeg ? 'คั่ว' + mainVeg : ''}สไตล์โฮมเมด`;
        category = 'noodle';
        imageUrl = 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80';
      } else if (mainVeg) {
        title = `ผัด${mainVeg}${mainMeat}${hasEgg ? 'คั่วไข่' : 'กระเทียมพริกสด'}`;
      } else {
        title = `${mainMeat}คั่วพริกเกลือกระเทียมหอมกระทะ`;
      }

      description = `เมนูผัดไฟแรงสไตล์โฮมเมด คั่วกลิ่นกระทะหอมเตะจมูก เคล้ารสชาติเข้มข้นของ ${mainMeat} และความกรอบของ ${mainVeg || 'ผักสด'}`;

      steps = [
        `ตั้งกระทะใส่น้ำมันเล็กน้อย เจียวกระเทียมและพริก (ถ้ามี) จนส่งกลิ่นหอมฟุ้ง`,
        `ใส่ ${mainMeat} ลงไปผัดเร็วๆ ยีให้เนื้อกระจายตัวจนเริ่มสุกเกรียมเล็กน้อย`,
        `${hasEgg ? 'แหวกตรงกลางกระทะ ตอกไข่ลงไป ยีพอแตกแล้วผัดคลุกเคล้าให้เข้ากัน, ' : ''}ใส่ ${mainVeg || 'ผักที่เตรียมไว้'} ลงไปผัดด้วยไฟแรง`,
        `ปรุงรสด้วยซอสหอยนางรม ซีอิ๊วขาว และตัดน้ำตาลปลายช้อน คั่วให้เข้ากัน 15 วินาทีแล้วตักเสิร์ฟ`,
      ];

      chefTip = '💡 เคล็ดลับเชฟ: เร่งไฟแรงสุดในจังหวะสุดท้ายก่อนยกลง จะทำให้ได้กลิ่นหอมไหม้กระทะ (Wok Hei) น่าทานยิ่งขึ้น';
      break;

    case 'fried':
      category = 'fried';
      cookingTime = 8;
      imageUrl = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80';

      if (hasEgg) {
        title = `ไข่เจียว${mainMeat}${mainVeg ? 'สอดไส้' + mainVeg : 'ทรงเครื่องกรอบนอกนุ่มใน'}`;
      } else {
        title = `${mainMeat}ทอดน้ำปลาหอมกระเทียมพริกไทย`;
      }

      description = `เมนูสีเหลืองทองกรอบอร่อย กลิ่นหอมเย้ายวนใจ ทานคู่กับข้าวสวยร้อนๆ หรือทานเล่นก็อร่อย`;

      steps = [
        `${hasEgg ? `ตอกไข่ใส่ชามผสม ใส่ ${mainMeat} และ ${mainVeg || 'ผักซอย'} ปรุงรสด้วยน้ำปลาและพริกไทย ตีให้เกิดฟองฟู` : `หมัก ${mainMeat} ด้วยน้ำปลา ซีอิ๊วขาว และกระเทียมสับ 5 นาที`}`,
        `ตั้งกระทะใส่น้ำมัน รอให้น้ำมันร้อนจัดจนเริ่มมีไอควันจางๆ`,
        `เทส่วนผสมลงไปทอดด้วยไฟกลางค่อนแรง ให้ด้านล่างเซ็ตตัวและเหลืองกรอบ`,
        `พลิกกลับด้าน ทอดต่ออีกประมาณ 1-2 นาทีจนสุกหอมทั้งสองฝั่ง ตักสะเด็ดน้ำมันพร้อมเสิร์ฟ`,
      ];

      chefTip = '💡 เคล็ดลับเชฟ: น้ำมันต้องร้อนจัดก่อนเทลงไป จะทำให้ไข่หรือเนื้อสัตว์ฟูกรอบไม่อมน้ำมัน';
      break;

    case 'clean':
    default:
      category = 'clean';
      cookingTime = 15;
      imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';

      title = `${mainMeat}ผัดน้ำ${mainVeg || 'ผักรวม'}เพื่อสุขภาพ (ไร้น้ำมัน)`;
      description = `เมนูคลีนแคลอรีต่ำ ปรุงด้วยวิธีผัดน้ำ โซเดียมต่ำ ไม่ใช้น้ำมัน อุดมด้วยไฟเบอร์และโปรตีนชั้นยอด`;

      steps = [
        `ใช้น้ำสต็อกหรือน้ำสะอาด 2-3 ช้อนโต๊ะแทนน้ำมันพืช ตั้งกระทะให้ร้อน`,
        `ใส่กระเทียมและ ${mainMeat} ลงไปผัดในน้ำจนสุกนุ่มทั่วกัน`,
        `ใส่ ${mainVeg} ${secondVeg ? 'และ ' + secondVeg : ''} ลงไป ผัดเร็วๆ จนผักสลดและหวานฉ่ำ`,
        `ปรุงรสบางๆ ด้วยซีอิ๊วขาวและพริกไทยดำป่น ปิดไฟ ตักเสิร์ฟพร้อมข้าวกล้อง`,
      ];

      chefTip = '💡 เคล็ดลับเชฟ: การใช้น้ำซุปผัดแทนน้ำมันช่วยลดแคลอรีได้กว่า 100-150 kcal เหมาะอย่างยิ่งสำหรับคนคุมน้ำหนัก';
      break;
  }

  // 3. Nutrition calculation
  const nutrition = calculateDynamicNutrition(selectedIngredients, effectiveStyle);

  // Accurate Food Photo Matcher
  const resolveAccurateDishImage = (dishTitle: string, style: CookingStyle): string => {
    if (dishTitle.includes('กะเพรา')) {
      return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('ข้าวผัด')) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('เส้น') || dishTitle.includes('มาม่า') || dishTitle.includes('ผัดไทย') || dishTitle.includes('ซีอิ๊ว')) {
      return 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('ต้มยำ')) {
      return 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('แกง') || dishTitle.includes('เขียวหวาน')) {
      return 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('หมูกรอบ') || dishTitle.includes('เบคอน')) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('กุ้ง') || dishTitle.includes('หมึก') || dishTitle.includes('ซีฟู้ด')) {
      return 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('ไข่เจียว') || dishTitle.includes('ไข่ขยี้') || style === 'fried') {
      return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('ต้มจืด') || dishTitle.includes('แกงจืด') || dishTitle.includes('ซุป') || style === 'soup') {
      return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80';
    }
    if (dishTitle.includes('สลัด') || style === 'clean') {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
  };

  const finalImageUrl = resolveAccurateDishImage(title, effectiveStyle);

  // 4. Build Recipe Object
  const generatedId = `chef_custom_${Date.now()}`;
  const recipe: Recipe = {
    id: generatedId,
    title,
    description,
    category,
    cooking_time_minutes: cookingTime,
    difficulty: 'ง่าย',
    calories: nutrition.calories,
    protein_g: nutrition.protein_g,
    carbs_g: nutrition.carbs_g,
    fat_g: nutrition.fat_g,
    image_url: finalImageUrl,
    video_url: `https://www.youtube.com/results?search_query=วิธีทำ${encodeURIComponent(title)}`,
    tags: ['สูตรคิดค้นพิเศษ', 'ทำจากของในตู้', effectiveStyle === 'clean' ? 'เพื่อสุขภาพ' : 'รสเด็ดโฮมเมด', `${cookingTime} นาที`],
    steps,
    ingredients: selectedIngredients.map(ing => ({
      ingredient_id: ing.id,
      amount: ing.category === 'meat' ? '120 กรัม' : ing.category === 'veggie' ? '100 กรัม' : 'ตามชอบ',
      is_optional: ing.category === 'seasoning',
      ingredient: ing,
    })),
  };

  return {
    recipe,
    chefTip,
    isCustomCreated: true,
  };
}
