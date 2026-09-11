'use client';

import React from 'react';
import { UnlockSuggestion, Recipe } from '../lib/types';
import { Lightbulb, PlusCircle, ArrowRight, ShoppingCart, AlertCircle, Sparkles } from 'lucide-react';

interface UnlockBannerProps {
  suggestions: UnlockSuggestion[];
  onAddIngredient: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onSimulatePorkEggScenario?: () => void;
}

export default function UnlockBanner({
  suggestions,
  onAddIngredient,
  onSelectRecipe,
  onSimulatePorkEggScenario,
}: UnlockBannerProps) {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
      border: '2px solid #FCD34D',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header with Preset Shortcut */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#B45309',
          fontWeight: 800,
          fontSize: '1.05rem',
        }}>
          <Lightbulb size={22} color="#D97706" />
          <span>ระบบ &quot;ขาดอีกแค่อย่างเดียว&quot; (Missing Ingredient Suggestion)</span>
        </div>

        {onSimulatePorkEggScenario && (
          <button
            type="button"
            onClick={onSimulatePorkEggScenario}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              color: '#B45309',
              border: '1px solid #F59E0B',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(180, 83, 9, 0.1)',
            }}
          >
            <Sparkles size={13} color="#D97706" />
            <span>จำลอง: &quot;มีไข่ + หมูสับ&quot; (ขาดกะเพรา)</span>
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.86rem', color: '#92400E', marginBottom: 16 }}>
        ตรวจพบเมนูที่คุณมีวัตถุดิบหลักเกือบครบแล้ว! เพียงซื้อวัตถุดิบเพิ่มอีกแค่ 1 ชิ้น คุณจะสามารถทำเมนูเหล่านี้ได้ทันที:
      </p>

      {suggestions.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.7)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#92400E',
        }}>
          ยังไม่มีเมนูที่ขาดเพียง 1 อย่าง — ลองคลิกปุ่ม <strong>&quot;จำลอง: มีไข่ + หมูสับ (ขาดกะเพรา)&quot;</strong> ด้านบนเพื่อทดสอบดูคำแนะนำได้เลยครับ!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {suggestions.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #FCD34D',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: '0 3px 10px rgba(217, 119, 6, 0.08)',
              }}
            >
              <div>
                {/* Specific Highlight Badge as requested: (ขาดวัตถุดิบ: ...) */}
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}>
                  <AlertCircle size={14} color="#EF4444" />
                  <span>(ขาดวัตถุดิบ: {item.missingIngredient.name}) 🛒 ซื้อเพิ่มแค่อย่างเดียว!</span>
                </div>

                <h4 style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  lineHeight: 1.3,
                }}>
                  {item.unlockedRecipe.title}
                </h4>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}>
                  ⏱️ ใช้เวลา {item.unlockedRecipe.cooking_time_minutes} นาที • 🔥 {item.unlockedRecipe.calories} kcal
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => onAddIngredient(item.missingIngredient.id)}
                  title="จำลองว่าซื้อวัตถุดิบนี้มาแล้วและใส่ตู้เย็น"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <PlusCircle size={15} />
                  <span>+ ซื้อมาแล้ว นำใส่ตู้</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectRecipe(item.unlockedRecipe)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    background: '#F1F5F9',
                    color: '#334155',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>ดูวิธีทำ</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
