'use client';

import React, { useState } from 'react';
import { Dices, Sparkles, Wand2, ChefHat, Flame, Soup, CookingPot } from 'lucide-react';
import { CookingStyle } from '../lib/chefGenerator';

interface RandomizerHeroProps {
  onRandomize: () => void;
  onGenerateChefRecipe: (style: CookingStyle) => void;
  eligibleCount: number;
  isRolling: boolean;
  isGenerating: boolean;
  selectedCount: number;
}

export default function RandomizerHero({
  onRandomize,
  onGenerateChefRecipe,
  eligibleCount,
  isRolling,
  isGenerating,
  selectedCount,
}: RandomizerHeroProps) {
  const [chosenStyle, setChosenStyle] = useState<CookingStyle>('auto');

  const stylesList: { id: CookingStyle; label: string; icon: string }[] = [
    { id: 'auto', label: 'ตามใจเชฟ 🪄', icon: '🪄' },
    { id: 'soup', label: 'เน้นต้ม/แกง 🍲', icon: '🍲' },
    { id: 'stir_fry', label: 'เน้นผัดหอมกระทะ 🍳', icon: '🍳' },
    { id: 'fried', label: 'เน้นทอด/ไข่ 🍗', icon: '🍗' },
    { id: 'clean', label: 'คลีนเพื่อสุขภาพ 🥗', icon: '🥗' },
  ];

  return (
    <div
      className="hero-card"
      style={{
        textAlign: 'center',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Sub-header: Style selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: 10,
      }}>
        <ChefHat size={16} color="var(--primary)" />
        <span>เลือกสไตล์อาหารที่อยากให้เชฟสร้างสรรค์:</span>
      </div>

      {/* Cooking Style Pills */}
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        {stylesList.map((st) => {
          const isSelected = chosenStyle === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setChosenStyle(st.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? 'var(--primary-light)' : '#F8FAFC',
                color: isSelected ? 'var(--primary-hover)' : 'var(--text-body)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dual Big Action Buttons */}
      <div
        className="hero-buttons-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 16,
          width: '100%',
        }}
      >
        <button
          type="button"
          onClick={() => onGenerateChefRecipe(chosenStyle)}
          disabled={selectedCount === 0 || isGenerating}
          className={`hero-btn-primary ${isGenerating ? '' : 'animate-pulse-glow'}`}
          style={{
            position: 'relative',
            background: selectedCount > 0
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : '#CBD5E1',
            color: '#FFFFFF',
            padding: '18px 36px',
            borderRadius: 'var(--radius-xl)',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: selectedCount > 0
              ? '0 10px 28px rgba(16, 185, 129, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
              : 'none',
            cursor: selectedCount > 0 && !isGenerating ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isGenerating ? 'scale(0.96)' : undefined,
          }}
        >
          <Wand2
            size={26}
            style={{
              animation: isGenerating ? 'spin-slot 0.8s infinite' : 'none',
            }}
          />
          <span>
            {isGenerating ? 'เชฟกำลังคิดค้นสูตรใหม่...' : '✨ ให้เชฟสร้างเมนูใหม่จากของที่มี!'}
          </span>
          <Sparkles size={20} style={{ opacity: 0.9 }} />
        </button>

        {/* Button 2: Classic Randomizer (สุ่มจากเมนูยอดนิยม) */}
        <button
          type="button"
          onClick={onRandomize}
          disabled={isRolling || eligibleCount === 0}
          className="hero-btn-secondary"
          style={{
            position: 'relative',
            background: eligibleCount > 0
              ? 'linear-gradient(135deg, #FF6422 0%, #FFA62B 100%)'
              : '#CBD5E1',
            color: '#FFFFFF',
            padding: '18px 34px',
            borderRadius: 'var(--radius-xl)',
            fontSize: '1.15rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: eligibleCount > 0
              ? '0 10px 28px rgba(255, 100, 34, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
              : 'none',
            cursor: eligibleCount > 0 && !isRolling ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isRolling ? 'scale(0.96)' : undefined,
          }}
        >
          <Dices
            size={26}
            style={{
              transform: isRolling ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.6s ease',
            }}
          />
          <span>{isRolling ? 'กำลังสุ่ม...' : '🎲 สุ่มจากเมนูยอดนิยม'}</span>
        </button>
      </div>

      {/* Info helper */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-muted)',
        fontSize: '0.86rem',
      }}>
        {selectedCount > 0 ? (
          <span>
            💡 คุณเลือกวัตถุดิบไว้ <strong>{selectedCount} อย่าง</strong> — สามารถกด <strong>&quot;✨ ให้เชฟสร้างเมนูใหม่&quot;</strong> เพื่อให้ระบบคิดสูตรเฉพาะตัว หรือกด <strong>&quot;🎲 สุ่มเมนูยอดนิยม&quot;</strong> ({eligibleCount} เมนู) ได้ทันที
          </span>
        ) : (
          <span style={{ color: 'var(--danger)' }}>
            ⚠️ ตู้เย็นว่างอยู่ กรุณาติ๊กเลือกหรือพิมพ์วัตถุดิบด้านบนเพื่อเริ่มคิดเมนู
          </span>
        )}
      </div>
    </div>
  );
}
