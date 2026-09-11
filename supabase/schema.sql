-- ==============================================================================
-- KIN-ARAI-DEE POS (กินอะไรดี - Smart Kitchen & Fridge Inventory System)
-- Supabase Schema & Seed Data
-- ==============================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    category TEXT NOT NULL, -- 'meat', 'veggie', 'seasoning', 'staple', 'other'
    icon TEXT NOT NULL,
    is_staple BOOLEAN DEFAULT false, -- มีติดตู้เย็นไว้เสมอ
    cal_per_100g INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'rice', 'noodle', 'soup', 'stir_fry', 'fried', 'clean'
    cooking_time_minutes INTEGER NOT NULL DEFAULT 15,
    difficulty TEXT NOT NULL DEFAULT 'ง่าย', -- 'ง่าย', 'ปานกลาง', 'เชฟมือโปร'
    calories INTEGER NOT NULL DEFAULT 350,
    protein_g INTEGER NOT NULL DEFAULT 15,
    carbs_g INTEGER NOT NULL DEFAULT 30,
    fat_g INTEGER NOT NULL DEFAULT 10,
    image_url TEXT NOT NULL,
    video_url TEXT,
    tags TEXT[] DEFAULT '{}',
    steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
    amount TEXT NOT NULL,
    is_optional BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_fridge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT DEFAULT 'guest',
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
    is_staple BOOLEAN DEFAULT false,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ingredient_id)
);

-- 2. Row Level Security (RLS) - Enable Read/Write for Demonstration
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fridge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public read recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Allow public read recipe_ingredients" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public all on user_fridge" ON user_fridge FOR ALL USING (true);

-- 3. Seed Categories
INSERT INTO categories (id, name_th, name_en, icon) VALUES
('rice', 'เมนูข้าว', 'Rice', '🍚'),
('noodle', 'เมนูเส้น', 'Noodles', '🍜'),
('soup', 'เมนูต้ม/แกง', 'Soup', '🍲'),
('stir_fry', 'เมนูผัด', 'Stir-Fry', '🍳'),
('fried', 'เมนูทอด', 'Fried', '🍗'),
('clean', 'อาหารคลีน/เพื่อสุขภาพ', 'Clean Food', '🥗')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Ingredients
INSERT INTO ingredients (id, name, name_en, category, icon, is_staple, cal_per_100g) VALUES
-- เนื้อสัตว์
('pork_minced', 'หมูสับ', 'Minced Pork', 'meat', '🥩', false, 240),
('pork_sliced', 'เนื้อหมู/หมูชิ้น', 'Sliced Pork', 'meat', '🥩', false, 210),
('chicken_breast', 'อกไก่', 'Chicken Breast', 'meat', '🍗', false, 120),
('shrimp', 'กุ้งสด', 'Fresh Shrimp', 'meat', '🦐', false, 85),
('canned_fish', 'ปลากระป๋อง', 'Canned Fish', 'meat', '🐟', false, 130),
('sausage', 'ไส้กรอก', 'Sausage', 'meat', '🌭', false, 280),
('egg_tofu', 'เต้าหู้ไข่', 'Egg Tofu', 'meat', '🧈', false, 75),

-- ผัก
('chinese_cabbage', 'ผักกาดขาว', 'Chinese Cabbage', 'veggie', '🥬', false, 16),
('holy_basil', 'ใบกะเพรา', 'Holy Basil', 'veggie', '🌿', false, 22),
('morning_glory', 'ผักบุ้ง', 'Morning Glory', 'veggie', '🌱', false, 19),
('chinese_kale', 'คะน้า', 'Chinese Kale', 'veggie', '🥬', false, 28),
('carrot', 'แครอท', 'Carrot', 'veggie', '🥕', false, 41),
('onion', 'หอมใหญ่', 'Onion', 'veggie', '🧅', false, 40),
('tomato', 'มะเขือเทศ', 'Tomato', 'veggie', '🍅', false, 18),
('spring_onion', 'ต้นหอม-ผักชี', 'Spring Onion & Cilantro', 'veggie', '🌿', false, 25),
('chili', 'พริกขี้หนู', 'Chili', 'veggie', '🌶️', true, 40),
('garlic', 'กระเทียม', 'Garlic', 'veggie', '🧄', true, 149),
('lime', 'มะนาว', 'Lime', 'veggie', '🍋', true, 29),
('ginger', 'ขิง', 'Ginger', 'veggie', '🫚', false, 80),
('tom_yum_herbs', 'ข่า ตะไคร้ ใบมะกรูด', 'Tom Yum Herbs', 'veggie', '🌿', false, 35),

-- เครื่องปรุง & วัตถุดิบติดตู้เย็นไว้เสมอ (Staple)
('egg', 'ไข่ไก่', 'Egg', 'staple', '🥚', true, 143),
('fish_sauce', 'น้ำปลา', 'Fish Sauce', 'seasoning', '🍾', true, 35),
('oyster_sauce', 'ซอสหอยนางรม', 'Oyster Sauce', 'seasoning', '🫙', true, 51),
('soy_sauce', 'ซีอิ๊วขาว', 'Light Soy Sauce', 'seasoning', '🍶', true, 50),
('sugar', 'น้ำตาลทราย', 'Sugar', 'seasoning', '🧂', true, 387),
('cooking_oil', 'น้ำมันพืช', 'Cooking Oil', 'seasoning', '🫗', true, 884),
('bouillon_cube', 'ซุปก้อน/รสดี', 'Soup Bouillon', 'seasoning', '🧊', true, 150),
('pepper', 'พริกไทยป่น', 'Ground Pepper', 'seasoning', '🧂', true, 250),
('chili_paste', 'น้ำพริกเผา', 'Thai Chili Paste', 'seasoning', '🌶️', false, 320),

-- คาร์โบไฮเดรต / แป้ง
('steamed_rice', 'ข้าวสวย', 'Cooked Rice', 'staple', '🍚', true, 130),
('wide_rice_noodles', 'เส้นใหญ่', 'Wide Rice Noodles', 'staple', '🍜', false, 160),
('glass_noodles', 'วุ้นเส้น', 'Glass Noodles', 'staple', '🥢', false, 120),
('instant_noodles', 'บะหมี่กึ่งสำเร็จรูป', 'Instant Noodles', 'staple', '🍜', false, 380)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Recipes
INSERT INTO recipes (id, title, description, category, cooking_time_minutes, difficulty, calories, protein_g, carbs_g, fat_g, image_url, video_url, tags, steps) VALUES
(
    'cabbage_soup_pork',
    'แกงจืดผักกาดขาวหมูสับ',
    'เมนูซดน้ำซุปร้อนๆ ชื่นใจ หวานผักกาดขาวและเนื้อหมูสับนุ่มๆ ทำง่ายมาก แคลอรีต่ำ',
    'soup',
    15,
    'ง่าย',
    180,
    18,
    8,
    7,
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['ทำง่าย', 'แคลอรีต่ำ', 'เมนูซดน้ำ', 'เด็กทานได้'],
    '[
        "1. หมักหมูสับด้วยซีอิ๊วขาวและพริกไทยเล็กน้อย ปั้นเป็นก้อนพอดีคำ",
        "2. ต้มน้ำสะอาดให้เดือด ใส่ซุปก้อนหรือกระเทียมบุบลงไป",
        "3. พอน้ำเดือดพล่าน ใส่หมูสับปั้นก้อนลงไปต้มจนสุกและลอยขึ้น",
        "4. ใส่ผักกาดขาวลงไป ปรุงรสด้วยซีอิ๊วขาว รอให้ผักสลด ปิดไฟ โรยพริกไทยและต้นหอมพร้อมเสิร์ฟ"
    ]'::jsonb
),
(
    'pad_krapao_pork',
    'ผัดกะเพราหมูสับไข่ดาว',
    'เมนูประจำชาติไทยรสจัดจ้าน เผ็ดร้อนหอมกลิ่นใบกะเพรา ทานคู่กับไข่ดาวกรอบไข่แดงเยิ้มๆ',
    'stir_fry',
    10,
    'ง่าย',
    550,
    28,
    45,
    26,
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['เมนูด่วน', 'เผ็ดแซ่บ', 'ยอดนิยมอันดับ 1'],
    '[
        "1. โขลกพริกขี้หนูกับกระเทียมพอหยาบๆ",
        "2. ตั้งกระทะใส่น้ำมัน นำพริกกระเทียมลงไปผัดจนหอมฉุน",
        "3. ใส่หมูสับลงไปผัด ยีให้เนื้อหมูสุกทั่ว ปรุงรสด้วยซอสหอยนางรม ซีอิ๊วขาว น้ำปลา และน้ำตาลตัดรสเล็กน้อย",
        "4. เร่งไฟแรง ใส่ใบกะเพราลงไป ผัดเร็วๆ 5-10 วินาที ปิดไฟ ตักราดข้าวสวยร้อนๆ แกล้มด้วยไข่ดาว"
    ]'::jsonb
),
(
    'pork_fried_rice',
    'ข้าวผัดหมูใส่ไข่',
    'ข้าวผัดหอมกลิ่นกระทะ ข้าวเรียงเม็ดสวย เคล้าเนื้อหมูและไข่ไก่หอมมัน',
    'rice',
    12,
    'ง่าย',
    480,
    22,
    58,
    16,
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['จานเดียวอิ่ม', 'ทำง่าย', 'เมนูเร่งด่วน'],
    '[
        "1. ตั้งกระทะใส่น้ำมัน เจียวกระเทียมสับให้หอม ใส่หมูชิ้นลงไปผัดพอสุก",
        "2. ตอกไข่ไก่ลงไป ยีให้กระจายทั่วกระทะ พอไข่เริ่มเซ็ตตัว",
        "3. ใส่ข้าวสวยลงไปคลุกเคล้า ปรุงรสด้วยซีอิ๊วขาว น้ำตาล และพริกไทยป่น",
        "4. ผัดด้วยไฟแรงให้เข้ากันทั่ว โรยต้นหอมซอย ตักใส่จานเสิร์ฟพร้อมมะนาวและแตงกวา"
    ]'::jsonb
),
(
    'minced_pork_omelette',
    'ไข่เจียวหมูสับทรงเครื่อง',
    'ไข่เจียวฟูกรอบนอกนุ่มใน หอมอร่อยกลมกล่อม ทำได้ง่ายมากใน 5 นาที',
    'fried',
    7,
    'ง่าย',
    340,
    19,
    4,
    27,
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['เมนูด่วนสุดๆ', 'ทำง่ายมาก', 'อร่อยคู่ข้าวสวย'],
    '[
        "1. ตอกไข่ใส่ชาม ใส่หมูสับ ปรุงรสด้วยน้ำปลาและซีอิ๊วขาวเล็กน้อย",
        "2. ตีไข่และหมูสับให้เข้ากันจนเกิดฟองฟู",
        "3. ตั้งกระทะใส่น้ำมัน รอน้ำมันร้อนจัด เทไข่ลงไปจากที่สูง",
        "4. ทอดจนด้านล่างเหลืองกรอบ พลิกกลับด้าน ทอดต่อจนสุกหอมทั้งสองด้าน ตักสะเด็ดน้ำมัน"
    ]'::jsonb
),
(
    'pad_cabbage_pork',
    'ผัดผักกาดขาวหมูสับ',
    'ผักกาดขาวหวานกรอบ ผัดเคล้าซอสหอยนางรมและกระเทียมเจียว เข้ากันดีกับเนื้อหมู',
    'stir_fry',
    10,
    'ง่าย',
    210,
    16,
    9,
    11,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['ผักเยอะ', 'ทำง่าย', 'แคลอรีเบาๆ'],
    '[
        "1. หั่นผักกาดขาวล้างให้สะอาด สะเด็ดน้ำ",
        "2. เจียวกระเทียมในน้ำมันร้อนๆ ให้หอม ใส่หมูสับลงไปผัดจนสุก",
        "3. เร่งไฟแรง ใส่ผักกาดขาวลงไป ปรุงด้วยซอสหอยนางรม ซีอิ๊วขาว น้ำตาลปลายช้อน",
        "4. ผัดเร็วๆ ให้ผักยุบและยังกรอบอยู่ ปิดไฟตักเสิร์ฟ"
    ]'::jsonb
),
(
    'clean_grilled_chicken',
    'อกไก่ผัดพริกไทยดำเพื่อสุขภาพ',
    'เมนูโปรตีนสูง ไขมันต่ำ เหมาะสำหรับสายรักสุขภาพและคุมน้ำหนัก รสชาติเข้มข้นถึงพริกไทย',
    'clean',
    15,
    'ง่าย',
    220,
    35,
    6,
    4,
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['อาหารคลีน', 'โปรตีนสูง', 'ลดน้ำหนัก', 'ไขมันต่ำ'],
    '[
        "1. หั่นอกไก่เป็นชิ้นพอดีคำ หมักด้วยซีอิ๊วขาวและพริกไทยดำ 5 นาที",
        "2. ตั้งกระทะทาน้ำมันบางๆ ใส่กระเทียมสับและหอมใหญ่ลงผัดให้ใส",
        "3. ใส่อกไก่ลงไปผัดจนสุกนุ่มทั่วกัน",
        "4. เติมแครอทและผักกาดขาวเล็กน้อย ปรุงรสเบาๆ ผัดจนผักสุก เสิร์ฟพร้อมข้าวกล้องหรือทานเดี่ยวๆ"
    ]'::jsonb
),
(
    'suki_soup_chicken',
    'สุกี้น้ำอกไก่รวมมิตร',
    'สุกี้น้ำร้อนๆ อุดมด้วยผักกาดขาว ผักบุ้ง วุ้นเส้น และอกไก่นุ่ม ซดคล่องคอ สุขภาพดีมาก',
    'soup',
    15,
    'ง่าย',
    260,
    27,
    28,
    3,
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['อาหารคลีน', 'เมนูซดน้ำ', 'ผักเยอะ', 'แคลต่ำ'],
    '[
        "1. ต้มน้ำซุปให้เดือด ใส่ซุปก้อนเล็กน้อย",
        "2. ใส่อกไก่หั่นชิ้นลงต้มจนสุก",
        "3. ใส่ผักกาดขาว ผักบุ้ง และวุ้นเส้นที่แช่น้ำแล้วลงไป",
        "4. ตอกไข่ไก่ใส่ชาม ตีพอแตกแล้วเทวนลงในหม้อซุป คนเบาๆ ปิดไฟ เสิร์ฟคู่น้ำจิ้มสุกี้"
    ]'::jsonb
),
(
    'spicy_canned_fish',
    'ยำปลากระป๋องสมุนไพร',
    'เมนูคู่หูเด็กหอ รสแซ่บจี๊ดจ๊าด หอมพริก มะนาว หอมแดง และผักชี ทำใน 3 นาที',
    'clean',
    5,
    'ง่าย',
    190,
    21,
    7,
    8,
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['เมนูด่วนสุดๆ', 'รสแซ่บ', 'ประหยัดงบ'],
    '[
        "1. เปิดปลากระป๋องเทใส่ชาม แยกเนื้อหรือยีพอหยาบตามชอบ",
        "2. ซอยพริกขี้หนู หอมใหญ่ ต้นหอมผักชีใส่ลงไป",
        "3. บีบน้ำมะนาว เหยาะน้ำปลาเล็กน้อย คนคลุกเคล้าให้เข้ากัน",
        "4. ตักเสิร์ฟคู่ข้าวสวยร้อนๆ หรือทานแกล้มผักสด"
    ]'::jsonb
),
(
    'tofu_pork_soup',
    'แกงจืดเต้าหู้ไข่หมูสับผักกาด',
    'แกงจืดรสละมุน ใส่เต้าหู้ไข่หั่นหนา หมูสับนุ่ม และผักกาดขาวหวานกรอบ',
    'soup',
    15,
    'ง่าย',
    210,
    20,
    9,
    9,
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['เด็กทานได้', 'เมนูซดน้ำ', 'ทำง่าย'],
    '[
        "1. หั่นเต้าหู้ไข่เป็นท่อนหนา พักไว้",
        "2. ต้มน้ำเดือดใส่ซุปก้อน ใส่หมูสับปั้นก้อนลงไปต้มจนสุก",
        "3. ใส่ผักกาดขาวลงไปต้มจนนิ่ม ปรุงด้วยซีอิ๊วขาว",
        "4. ค่อยๆ ใส่เต้าหู้ไข่ลงไป ต้มต่ออีก 1 นาทีเบาๆ ปิดไฟโรยพริกไทย"
    ]'::jsonb
),
(
    'pad_see_ew_pork',
    'ผัดซีอิ๊วหมูเส้นใหญ่',
    'เส้นใหญ่นุ่มเหนียว ผัดไฟแรงเคลือบซีอิ๊วดำหอมกลิ่นกระทะ หมูนุ่มและผักคะน้ากรอบ',
    'noodle',
    12,
    'ง่าย',
    520,
    25,
    62,
    18,
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ARRAY['เมนูเส้นยอดฮิต', 'จานเดียวอิ่ม', 'ทำง่าย'],
    '[
        "1. ผัดกระเทียมกับหมูชิ้นในน้ำมันร้อนจนสุก",
        "2. ตอกไข่ไก่ลงไป ยีให้สุกเป็นชิ้น",
        "3. ใส่เส้นใหญ่ ปรุงรสด้วยซีอิ๊วดำ ซอสหอยนางรม น้ำปลา น้ำตาล",
        "4. ใส่ผักคะน้า เร่งไฟแรง ผัดเร็วๆ จนเส้นเกรียมหอม ปิดไฟโรยพริกไทย"
    ]'::jsonb
);

-- 6. Link Recipe Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, is_optional) VALUES
-- แกงจืดผักกาดขาวหมูสับ
('cabbage_soup_pork', 'pork_minced', '150 กรัม', false),
('cabbage_soup_pork', 'chinese_cabbage', '150 กรัม', false),
('cabbage_soup_pork', 'garlic', '2 กลีบ', true),
('cabbage_soup_pork', 'soy_sauce', '1 ช้อนโต๊ะ', true),
('cabbage_soup_pork', 'bouillon_cube', '1/2 ก้อน', true),
('cabbage_soup_pork', 'pepper', 'ตามชอบ', true),

-- ผัดกะเพราหมูสับไข่ดาว
('pad_krapao_pork', 'pork_minced', '150 กรัม', false),
('pad_krapao_pork', 'holy_basil', '1 กำมือ', false),
('pad_krapao_pork', 'chili', '5-7 เม็ด', false),
('pad_krapao_pork', 'garlic', '3 กลีบ', false),
('pad_krapao_pork', 'egg', '1 ฟอง (ไข่ดาว)', false),
('pad_krapao_pork', 'oyster_sauce', '1 ช้อนโต๊ะ', true),
('pad_krapao_pork', 'fish_sauce', '1 ช้อนโต๊ะ', true),
('pad_krapao_pork', 'steamed_rice', '1 จาน', true),

-- ข้าวผัดหมูใส่ไข่
('pork_fried_rice', 'pork_sliced', '100 กรัม', false),
('pork_fried_rice', 'egg', '1-2 ฟอง', false),
('pork_fried_rice', 'steamed_rice', '1 ถ้วย', false),
('pork_fried_rice', 'garlic', '2 กลีบ', true),
('pork_fried_rice', 'spring_onion', '1 ต้น', true),
('pork_fried_rice', 'soy_sauce', '1 ช้อนโต๊ะ', true),

-- ไข่เจียวหมูสับทรงเครื่อง
('minced_pork_omelette', 'egg', '2-3 ฟอง', false),
('minced_pork_omelette', 'pork_minced', '80 กรัม', false),
('minced_pork_omelette', 'fish_sauce', '1 ช้อนโต๊ะ', true),
('minced_pork_omelette', 'cooking_oil', 'สำหรับทอด', true),

-- ผัดผักกาดขาวหมูสับ
('pad_cabbage_pork', 'chinese_cabbage', '200 กรัม', false),
('pad_cabbage_pork', 'pork_minced', '100 กรัม', false),
('pad_cabbage_pork', 'garlic', '2 กลีบ', true),
('pad_cabbage_pork', 'oyster_sauce', '1.5 ช้อนโต๊ะ', true),

-- อกไก่ผัดพริกไทยดำ
('clean_grilled_chicken', 'chicken_breast', '180 กรัม', false),
('clean_grilled_chicken', 'pepper', '1 ช้อนชา', false),
('clean_grilled_chicken', 'onion', '1/2 หัว', true),
('clean_grilled_chicken', 'garlic', '2 กลีบ', true),

-- สุกี้น้ำอกไก่รวมมิตร
('suki_soup_chicken', 'chicken_breast', '120 กรัม', false),
('suki_soup_chicken', 'chinese_cabbage', '100 กรัม', false),
('suki_soup_chicken', 'morning_glory', '50 กรัม', true),
('suki_soup_chicken', 'glass_noodles', '40 กรัม', false),
('suki_soup_chicken', 'egg', '1 ฟอง', false),

-- ยำปลากระป๋องสมุนไพร
('spicy_canned_fish', 'canned_fish', '1 กระป๋อง', false),
('spicy_canned_fish', 'chili', '3-5 เม็ด', false),
('spicy_canned_fish', 'lime', '1 ลูก', false),
('spicy_canned_fish', 'onion', '1/4 หัว', true),
('spicy_canned_fish', 'spring_onion', '1 ต้น', true),

-- แกงจืดเต้าหู้ไข่หมูสับ
('tofu_pork_soup', 'egg_tofu', '1 หลอด', false),
('tofu_pork_soup', 'pork_minced', '100 กรัม', false),
('tofu_pork_soup', 'chinese_cabbage', '100 กรัม', false),
('tofu_pork_soup', 'bouillon_cube', '1/2 ก้อน', true),

-- ผัดซีอิ๊วหมูเส้นใหญ่
('pad_see_ew_pork', 'wide_rice_noodles', '150 กรัม', false),
('pad_see_ew_pork', 'pork_sliced', '100 กรัม', false),
('pad_see_ew_pork', 'chinese_kale', '100 กรัม', false),
('pad_see_ew_pork', 'egg', '1 ฟอง', false),
('pad_see_ew_pork', 'garlic', '2 กลีบ', true),
('pad_see_ew_pork', 'soy_sauce', '1 ช้อนโต๊ะ', true);
