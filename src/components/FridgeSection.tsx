'use client';

import React, { useState } from 'react';
import { Ingredient, IngredientCategory } from '../lib/types';
import { Plus, Search, Star, Trash2, Check, Sparkles, AlertCircle, X } from 'lucide-react';

interface FridgeSectionProps {
  ingredients: Ingredient[];
  selectedIds: Set<string>;
  stapleIds: Set<string>;
  onToggleIngredient: (id: string) => void;
  onToggleStaple: (id: string) => void;
  onAddCustomIngredient: (name: string, category: IngredientCategory, icon?: string, cal?: number) => void;
  onDeleteCustomIngredient?: (id: string) => void;
  onClearFridge: () => void;
  onSelectAllStaples: () => void;
  onApplyPresetScenario: () => void;
}

export function guessCategory(name: string): IngredientCategory {
  const lower = name.toLowerCase();
  if (lower.includes('ไข่') || lower.includes('egg')) return 'staple';
  if (
    lower.includes('หมู') || lower.includes('ไก่') || lower.includes('เนื้อ') || lower.includes('กุ้ง') ||
    lower.includes('ปลา') || lower.includes('หมึก') || lower.includes('ปู') || lower.includes('หอย') ||
    lower.includes('เป็ด') || lower.includes('ไส้กรอก') || lower.includes('แฮม') || lower.includes('เบคอน') ||
    lower.includes('เต้าหู้') || lower.includes('ลูกชิ้น') || lower.includes('pork') || lower.includes('chicken') ||
    lower.includes('beef') || lower.includes('shrimp') || lower.includes('fish')
  ) {
    return 'meat';
  }
  if (
    lower.includes('ผัก') || lower.includes('กะเพรา') || lower.includes('คะน้า') || lower.includes('กะหล่ำ') ||
    lower.includes('เห็ด') || lower.includes('บุ้ง') || lower.includes('แตง') || lower.includes('มะเขือ') ||
    lower.includes('หอม') || lower.includes('พริก') || lower.includes('กระเทียม') || lower.includes('ขิง') ||
    lower.includes('ข่า') || lower.includes('แครอท') || lower.includes('ข้าวโพด') || lower.includes('broccoli')
  ) {
    return 'veggie';
  }
  if (
    lower.includes('น้ำปลา') || lower.includes('ซีอิ๊ว') || lower.includes('น้ำตาล') || lower.includes('ซอส') ||
    lower.includes('พริกแกง') || lower.includes('กะทิ') || lower.includes('เนย') || lower.includes('ชีส') ||
    lower.includes('เกลือ') || lower.includes('น้ำมัน') || lower.includes('พริกไทย') || lower.includes('ซุป')
  ) {
    return 'seasoning';
  }
  if (
    lower.includes('ข้าว') || lower.includes('เส้น') || lower.includes('บะหมี่') || lower.includes('มาม่า') ||
    lower.includes('วุ้นเส้น') || lower.includes('ขนมปัง') || lower.includes('แป้ง') || lower.includes('noodle') ||
    lower.includes('rice')
  ) {
    return 'carb';
  }
  return 'meat';
}

export function guessEmoji(name: string, category: IngredientCategory): string {
  const lower = name.toLowerCase();
  if (lower.includes('หมึก') || lower.includes('squid')) return '🦑';
  if (lower.includes('กุ้ง') || lower.includes('shrimp')) return '🦐';
  if (lower.includes('เบคอน') || lower.includes('bacon')) return '🥓';
  if (lower.includes('หมูกรอบ')) return '🥓';
  if (lower.includes('เห็ด') || lower.includes('mushroom')) return '🍄';
  if (lower.includes('ไส้กรอก') || lower.includes('sausage')) return '🌭';
  if (lower.includes('ปู') || lower.includes('crab')) return '🦀';
  if (lower.includes('ปลา') || lower.includes('fish')) return '🐟';
  if (lower.includes('ไก่') || lower.includes('chicken')) return '🍗';
  if (lower.includes('หมู') || lower.includes('pork') || lower.includes('เนื้อ') || lower.includes('beef')) return '🥩';
  if (lower.includes('ชีส') || lower.includes('cheese')) return '🧀';
  if (lower.includes('เนย') || lower.includes('butter')) return '🧈';
  if (lower.includes('เต้าหู้')) return '🧈';
  if (lower.includes('ข้าวโพด') || lower.includes('corn')) return '🌽';
  if (lower.includes('บรอกโคลี') || lower.includes('broccoli')) return '🥦';
  if (lower.includes('กะหล่ำ') || lower.includes('cabbage') || lower.includes('ผักกาด')) return '🥬';
  if (lower.includes('แครอท') || lower.includes('carrot')) return '🥕';
  if (lower.includes('มะเขือเทศ') || lower.includes('tomato')) return '🍅';
  if (lower.includes('กะทิ') || lower.includes('มะพร้าว')) return '🥥';
  if (lower.includes('ขนมปัง') || lower.includes('bread')) return '🍞';
  if (lower.includes('ไข่') || lower.includes('egg')) return '🥚';
  if (lower.includes('ข้าว') || lower.includes('rice')) return '🍚';
  if (lower.includes('เส้น') || lower.includes('บะหมี่') || lower.includes('มาม่า') || lower.includes('noodle')) return '🍜';
  if (lower.includes('พริก') || lower.includes('chili')) return '🌶️';
  if (lower.includes('กระเทียม') || lower.includes('garlic')) return '🧄';
  if (lower.includes('มะนาว') || lower.includes('lime')) return '🍋';

  const defaultCategoryIcons: Record<IngredientCategory, string> = {
    meat: '🥩',
    veggie: '🥬',
    seasoning: '🧂',
    carb: '🍚',
    staple: '🥚',
    other: '🍱',
  };
  return defaultCategoryIcons[category] || '🍱';
}

const QUICK_SUGGESTIONS = [
  { name: 'หมูกรอบ', cat: 'meat' as const, icon: '🥓', cal: 385 },
  { name: 'เบคอน', cat: 'meat' as const, icon: '🥓', cal: 400 },
  { name: 'ปลาหมึกสด', cat: 'meat' as const, icon: '🦑', cal: 92 },
  { name: 'เห็ดเข็มทอง', cat: 'veggie' as const, icon: '🍄', cal: 37 },
  { name: 'บรอกโคลี', cat: 'veggie' as const, icon: '🥦', cal: 34 },
  { name: 'ข้าวโพดอ่อน', cat: 'veggie' as const, icon: '🌽', cal: 30 },
  { name: 'ชีส', cat: 'seasoning' as const, icon: '🧀', cal: 402 },
  { name: 'กะทิ', cat: 'seasoning' as const, icon: '🥥', cal: 230 },
  { name: 'พริกแกงเขียวหวาน', cat: 'seasoning' as const, icon: '🍛', cal: 140 },
];

export default function FridgeSection({
  ingredients,
  selectedIds,
  stapleIds,
  onToggleIngredient,
  onToggleStaple,
  onAddCustomIngredient,
  onDeleteCustomIngredient,
  onClearFridge,
  onSelectAllStaples,
  onApplyPresetScenario,
}: FridgeSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [customCategory, setCustomCategory] = useState<IngredientCategory>('meat');
  const [customCalories, setCustomCalories] = useState<string>('');

  // Handle Quick Add directly from typed name (works for both Search bar Enter and Click)
  const handleQuickAddByName = (rawName: string) => {
    const trimmed = rawName.trim();
    if (!trimmed) return;

    // Check if ingredient with exact name already exists in catalog
    const lower = trimmed.toLowerCase();
    const existing = ingredients.find(
      i => i.name.toLowerCase() === lower ||
           (i.name_en && i.name_en.toLowerCase() === lower)
    );

    if (existing) {
      if (!selectedIds.has(existing.id)) {
        onToggleIngredient(existing.id);
      }
    } else {
      const cat = guessCategory(trimmed);
      const icon = guessEmoji(trimmed, cat);
      onAddCustomIngredient(trimmed, cat, icon);
    }

    setSearchQuery('');
  };

  // Handle adding custom ingredient via explicit form
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const icon = guessEmoji(trimmed, customCategory);
    const cal = customCalories ? parseInt(customCalories, 10) : undefined;

    onAddCustomIngredient(trimmed, customCategory, icon, cal);
    setCustomInput('');
    setCustomCalories('');
    setSearchQuery('');
  };

  const handleQuickAdd = (item: typeof QUICK_SUGGESTIONS[0]) => {
    const existing = ingredients.find(i => i.name === item.name);
    if (existing) {
      if (!selectedIds.has(existing.id)) {
        onToggleIngredient(existing.id);
      }
    } else {
      onAddCustomIngredient(item.name, item.cat, item.icon, item.cal);
    }
  };

  const customCount = ingredients.filter(i => i.is_custom).length;

  // Filtered ingredients based on search and active category tab
  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ing.name_en && ing.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'staples') return stapleIds.has(ing.id);
    if (activeTab === 'custom') return ing.is_custom;
    return ing.category === activeTab;
  });

  return (
    <section
      className="fridge-section-card"
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header & Quick Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>🧊</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              ตู้เย็นของฉัน (Fridge Inventory)
            </h2>
            <span style={{
              background: '#F1F5F9',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              {ingredients.length} วัตถุดิบในคลัง
            </span>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 2 }}>
            คลิกติ๊กเลือกวัตถุดิบที่มีในตู้ หรือพิมพ์เพิ่มวัตถุดิบใหม่เข้าคลังได้ไม่จำกัด
          </p>
        </div>

        {/* Action Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onApplyPresetScenario}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              color: '#C2410C',
              border: '1px solid #FDBA74',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} color="#EA580C" />
            <span>จำลอง: &quot;หมูสับ + ผักกาดขาว&quot;</span>
          </button>

          <button
            type="button"
            onClick={onSelectAllStaples}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#F1F5F9',
              color: '#334155',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Check size={14} />
            <span>เลือกของติดตู้ทั้งหมด</span>
          </button>

          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={onClearFridge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={14} />
              <span>ล้างตู้เย็น</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Input Options: Unified Search/Add Bar + Custom Ingredient Type-In */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 14,
        marginBottom: 14,
      }}>
        {/* 1. Search Bar with Instant Enter-to-Add Feature */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#F8FAFC',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '9px 14px',
            transition: 'border-color 0.2s ease',
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="ค้นหา หรือ พิมพ์ชื่อวัตถุดิบเพื่อเพิ่ม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickAddByName(searchQuery);
                }
              }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick-Add pill if user typed in the search box */}
          {searchQuery.trim() && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#FFF7ED',
              border: '1px solid #FDBA74',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              marginTop: 6,
              fontSize: '0.82rem',
            }}>
              <span style={{ color: '#9A3412', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>💡</span>
                <span>กด Enter หรือคลิกเพื่อเพิ่ม <strong>&quot;{searchQuery.trim()}&quot;</strong></span>
              </span>
              <button
                type="button"
                onClick={() => handleQuickAddByName(searchQuery)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(255, 100, 34, 0.25)',
                }}
              >
                <Plus size={13} />
                <span>เพิ่มเข้าตู้</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Custom Type-in with Auto Category Detection & Calorie input */}
        <form onSubmit={handleAddCustom} style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#FFF7ED',
            border: '1.5px solid #FFD8A8',
            borderRadius: 'var(--radius-md)',
            padding: '4px 10px',
          }}>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as IngredientCategory)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.8rem',
                color: '#C2410C',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="meat">🥩 เนื้อสัตว์/ซีฟู้ด</option>
              <option value="veggie">🥬 ผัก/เห็ด</option>
              <option value="seasoning">🧂 เครื่องปรุง</option>
              <option value="carb">🍚 แป้ง/เส้น</option>
              <option value="other">🍱 อื่นๆ</option>
            </select>

            <input
              type="text"
              placeholder="พิมพ์ชื่อวัตถุดิบเอง เช่น หมูสามชั้น, ชีส..."
              value={customInput}
              onChange={(e) => {
                const val = e.target.value;
                setCustomInput(val);
                if (val.trim()) {
                  const guessed = guessCategory(val);
                  setCustomCategory(guessed);
                }
              }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.88rem',
                color: 'var(--text-main)',
              }}
            />

            <input
              type="number"
              placeholder="kcal"
              title="แคลอรีต่อ 100 กรัม (ไม่บังคับ ระบบจะคำนวณให้อัตโนมัติ)"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              style={{
                width: 48,
                border: 'none',
                background: 'rgba(255,255,255,0.9)',
                padding: '3px 4px',
                borderRadius: 4,
                fontSize: '0.75rem',
                outline: 'none',
                textAlign: 'center',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!customInput.trim()}
            style={{
              background: customInput.trim() ? 'var(--primary)' : '#CBD5E1',
              color: '#FFFFFF',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              cursor: customInput.trim() ? 'pointer' : 'not-allowed',
              boxShadow: customInput.trim() ? '0 2px 8px rgba(255,100,34,0.3)' : 'none',
            }}
          >
            <Plus size={16} />
            <span>เพิ่มเข้าตู้</span>
          </button>
        </form>
      </div>

      {/* Quick-Add Popular Suggestions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 16,
        padding: '8px 12px',
        background: '#FFFDF9',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border)',
      }}>
        <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
          💡 คลิกเพิ่มด่วน:
        </span>
        {QUICK_SUGGESTIONS.map((item, idx) => {
          const isAdded = selectedIds.has(item.name) || ingredients.some(i => i.name === item.name && selectedIds.has(i.id));
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAdd(item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: isAdded ? 700 : 500,
                background: isAdded ? '#ECFDF5' : '#FFFFFF',
                color: isAdded ? '#047857' : 'var(--text-body)',
                border: `1px solid ${isAdded ? '#A7F3D0' : '#E2E8F0'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
              <span style={{ fontSize: '0.68rem', color: isAdded ? '#059669' : '#94A3B8' }}>
                {isAdded ? '✓' : '+'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 8,
        marginBottom: 16,
      }}>
        {[
          { id: 'all', label: `ทั้งหมด (${ingredients.length})`, icon: '🧺' },
          { id: 'meat', label: 'เนื้อสัตว์ & ซีฟู้ด', icon: '🥩' },
          { id: 'veggie', label: 'ผัก & เห็ด', icon: '🥬' },
          { id: 'seasoning', label: 'เครื่องปรุง & ซอส', icon: '🧂' },
          { id: 'carb', label: 'ข้าว & เส้น', icon: '🍚' },
          { id: 'staples', label: 'มีติดตู้เสมอ ⭐', icon: '⭐' },
          ...(customCount > 0 ? [{ id: 'custom', label: `เพิ่มเอง (${customCount}) ✨`, icon: '✨' }] : []),
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--primary)' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : 'var(--text-body)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Ingredients Grid */}
      <div
        className="fridge-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
          gap: 10,
          maxHeight: 420,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {filteredIngredients.map(ing => {
          const isSelected = selectedIds.has(ing.id);
          const isStaple = stapleIds.has(ing.id);

          return (
            <div
              key={ing.id}
              className="ingredient-item-chip"
              onClick={() => onToggleIngredient(ing.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '14px 8px 10px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--primary-light)' : '#FFFFFF',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: isSelected ? '0 4px 14px rgba(255, 100, 34, 0.18)' : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                userSelect: 'none',
              }}
            >
              {/* Star toggle for "มีติดไว้เสมอ" (Staple) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStaple(ing.id);
                }}
                title={isStaple ? 'เป็นของติดตู้เย็นเสมอ (คลิกเพื่อยกเลิก)' : 'ตั้งเป็นของมีติดตู้เย็นเสมอ'}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  padding: 3,
                  borderRadius: '50%',
                  color: isStaple ? '#F59E0B' : '#CBD5E1',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Star size={15} fill={isStaple ? '#F59E0B' : 'transparent'} />
              </button>

              {/* If Custom Ingredient, show delete button */}
              {ing.is_custom && onDeleteCustomIngredient && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomIngredient(ing.id);
                  }}
                  title="ลบวัตถุดิบนี้ออกจากคลัง"
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#FEE2E2',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} />
                </button>
              )}

              {/* Icon Emoji */}
              <div
                className="ingredient-item-icon"
                style={{
                  fontSize: '1.9rem',
                  lineHeight: 1,
                  marginBottom: 6,
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}
              >
                {ing.icon}
              </div>

              {/* Name */}
              <div
                className="ingredient-item-name"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--primary-hover)' : 'var(--text-main)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {ing.name}
              </div>

              {/* Custom Badge or Calorie Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                {ing.is_custom && (
                  <span style={{
                    fontSize: '0.62rem',
                    background: '#FEF3C7',
                    color: '#B45309',
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontWeight: 700,
                  }}>
                    เพิ่มเอง
                  </span>
                )}
                {ing.cal_per_100g && (
                  <span
                    className="ingredient-item-cal"
                    style={{
                      fontSize: '0.68rem',
                      color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    ~{ing.cal_per_100g} kcal
                  </span>
                )}
              </div>

              {/* Checked Indicator (for standard items) */}
              {isSelected && !ing.is_custom && (
                <div style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state when searching and item is not found */}
        {filteredIngredients.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '32px 20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed #FB923C',
          }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🥕✨</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9A3412', marginBottom: 4 }}>
              ยังไม่มี &quot;{searchQuery}&quot; ในรายการมาตรฐาน
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#C2410C', maxWidth: 460, margin: '0 auto 16px', lineHeight: 1.4 }}>
              คลิกปุ่มด้านล่างเพื่อเพิ่ม <strong>&quot;{searchQuery}&quot;</strong> เข้าตู้เย็นของคุณได้ทันที! ระบบจะจดจำและคำนวณแคลอรีให้อัตโนมัติ
            </p>
            <button
              type="button"
              onClick={() => handleQuickAddByName(searchQuery)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 100, 34, 0.35)',
              }}
            >
              <Plus size={18} />
              <span>เพิ่ม &quot;{searchQuery}&quot; เข้าตู้เย็นตอนนี้เลย</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Items Summary Tray */}
      <div style={{
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px dashed var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-body)' }}>
          <span>📦 ของที่เลือกไว้:</span>
          <strong>{selectedIds.size} อย่าง</strong>
          {selectedIds.size === 0 && (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              (ยังไม่ได้เลือกวัตถุดิบ - ติ๊กเลือกด้านบน หรือคลิกปุ่ม &quot;จำลอง: หมูสับ + ผักกาดขาว&quot;)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from(selectedIds).slice(0, 6).map(id => {
            const ing = ingredients.find(i => i.id === id);
            if (!ing) return null;
            return (
              <span
                key={id}
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                {ing.icon} {ing.name}
              </span>
            );
          })}
          {selectedIds.size > 6 && (
            <span style={{
              background: '#F1F5F9',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}>
              +{selectedIds.size - 6} อย่าง
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
