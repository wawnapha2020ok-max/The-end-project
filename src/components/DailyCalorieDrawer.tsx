'use client';

import React, { useState } from 'react';
import { MealLog, MealType } from '../lib/types';
import { X, Flame, Trash2, Plus, Calendar, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface DailyCalorieDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  meals: MealLog[];
  onDeleteMeal: (id: string) => void;
  onClearDay: () => void;
  calorieGoal: number;
  onUpdateGoal: (newGoal: number) => void;
}

const MEAL_LABELS: Record<MealType, { label: string; icon: string; color: string }> = {
  breakfast: { label: 'มื้อเช้า', icon: '🌅', color: '#F59E0B' },
  lunch: { label: 'มื้อกลางวัน', icon: '☀️', color: '#EF4444' },
  dinner: { label: 'มื้อเย็น', icon: '🌙', color: '#8B5CF6' },
  snack: { label: 'ของว่าง / ดึก', icon: '🦉', color: '#10B981' },
};

export default function DailyCalorieDrawer({
  isOpen,
  onClose,
  meals,
  onDeleteMeal,
  onClearDay,
  calorieGoal,
  onUpdateGoal,
}: DailyCalorieDrawerProps) {
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>(calorieGoal.toString());

  if (!isOpen) return null;

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein_g, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbs_g, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fat_g, 0);

  const percentOfGoal = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customGoalInput, 10);
    if (parsed && parsed >= 500 && parsed <= 5000) {
      onUpdateGoal(parsed);
      setIsEditingGoal(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 65,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#FFF7ED',
              color: '#EA580C',
              padding: 8,
              borderRadius: 'var(--radius-md)',
            }}>
              <Flame size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                บันทึกแคลอรี่วันนี้ (Calorie Diary)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                สรุปยอดพลังงานและสารอาหารรายมื้อ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Calorie Goal Card */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1px solid #FED7AA',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginBottom: 20,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9A3412' }}>
                เป้าหมายแคลอรี่ประจำวัน:
              </span>
              {isEditingGoal ? (
                <form onSubmit={handleSaveGoal} style={{ display: 'flex', gap: 4 }}>
                  <input
                    type="number"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    style={{
                      width: 70,
                      padding: '2px 6px',
                      fontSize: '0.8rem',
                      borderRadius: 4,
                      border: '1px solid #EA580C',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      fontSize: '0.75rem',
                      background: '#EA580C',
                      color: '#FFF',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    บันทึก
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(true)}
                  style={{
                    fontSize: '0.75rem',
                    color: '#C2410C',
                    textDecoration: 'underline',
                    fontWeight: 600,
                  }}
                >
                  แก้ไขเป้าหมาย
                </button>
              )}
            </div>

            {/* Big Numbers */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#C2410C', lineHeight: 1 }}>
                {totalCalories}
              </span>
              <span style={{ fontSize: '1rem', color: '#9A3412', fontWeight: 600 }}>
                / {calorieGoal} kcal
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: percentOfGoal >= 100 ? '#DC2626' : '#EA580C',
              }}>
                {percentOfGoal}%
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: 10,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${percentOfGoal}%`,
                height: '100%',
                background: percentOfGoal > 100
                  ? '#EF4444'
                  : 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
                transition: 'width 0.4s ease',
              }} />
            </div>

            {/* Macronutrients breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid rgba(234, 88, 12, 0.2)',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9A3412' }}>โปรตีน (Protein)</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7C2D12' }}>{totalProtein}g</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9A3412' }}>คาร์โบไฮเดรต</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7C2D12' }}>{totalCarbs}g</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9A3412' }}>ไขมัน (Fat)</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#7C2D12' }}>{totalFat}g</div>
              </div>
            </div>
          </div>

          {/* Meals Log List */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              มื้ออาหารที่บันทึกแล้ว ({meals.length} มื้อ)
            </h4>
            {meals.length > 0 && (
              <button
                type="button"
                onClick={onClearDay}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 500,
                }}
              >
                <Trash2 size={12} />
                <span>ล้างประวัติวันนี้</span>
              </button>
            )}
          </div>

          {meals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              background: '#F8FAFC',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border)',
            }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>ยังไม่มีการบันทึกมื้ออาหารวันนี้</p>
              <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
                เมื่อคุณสุ่มหรือดูเมนูใด ให้กดปุ่ม <strong>&quot;🍽️ บันทึกเมนูนี้ที่กินไป&quot;</strong> ในหน้ารายละเอียดเมนูเพื่อเริ่มสะสมแคลอรี่
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {meals.map((item) => {
                const mealMeta = MEAL_LABELS[item.mealType] || MEAL_LABELS.lunch;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.4rem' }}>{mealMeta.icon}</span>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 2,
                        }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: mealMeta.color,
                            background: '#F8FAFC',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}>
                            {mealMeta.label}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {item.loggedAt}
                          </span>
                        </div>
                        <h5 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                        }}>
                          {item.recipeTitle}
                        </h5>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          P:{item.protein_g}g • C:{item.carbs_g}g • F:{item.fat_g}g
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#EA580C' }}>
                          +{item.calories}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>kcal</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteMeal(item.id)}
                        title="ลบรายการนี้"
                        style={{
                          color: '#CBD5E1',
                          padding: 4,
                          cursor: 'pointer',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#CBD5E1')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <span>💡 แนะนำแคลอรี่เฉลี่ย: 1,800 - 2,200 kcal/วัน</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--primary)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
