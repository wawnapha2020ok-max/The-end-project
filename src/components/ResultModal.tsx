'use client';

import React, { useState, useEffect } from 'react';
import { MatchResult, Recipe, MealType } from '../lib/types';
import confetti from 'canvas-confetti';
import {
  X,
  RotateCw,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Video,
  Utensils,
  Share2,
  Sparkles,
  ShoppingBag,
  BookmarkPlus,
  Check,
  Wand2,
  Plus,
} from 'lucide-react';

interface ResultModalProps {
  match: MatchResult;
  onClose: () => void;
  onReroll: () => void;
  onCookDone: (recipe: Recipe) => void;
  canReroll: boolean;
  isCustomCreated?: boolean;
  chefTip?: string;
  onSaveRecipe?: (recipe: Recipe) => void;
  isSaved?: boolean;
  onLogMeal?: (recipe: Recipe, mealType: MealType) => void;
  isMealLogged?: boolean;
  onAddIngredientToFridge?: (id: string) => void;
}

export default function ResultModal({
  match,
  onClose,
  onReroll,
  onCookDone,
  canReroll,
  isCustomCreated,
  chefTip,
  onSaveRecipe,
  isSaved,
  onLogMeal,
  isMealLogged,
  onAddIngredientToFridge,
}: ResultModalProps) {
  const { recipe, matchPercentage, availableIngredients, missingIngredients } = match;

  // Cooking Timer state
  const totalSeconds = recipe.cooking_time_minutes * 60;
  const [timeLeft, setTimeLeft] = useState<number>(totalSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  // Trigger celebratory confetti on initial load
  useEffect(() => {
    try {
      confetti({
        particleCount: isCustomCreated ? 90 : 70,
        spread: 65,
        origin: { y: 0.6 },
        colors: isCustomCreated
          ? ['#10B981', '#34D399', '#FFA62B', '#FF6422']
          : ['#FF6422', '#FFA62B', '#10B981', '#3B82F6'],
      });
    } catch {
      // Ignore if canvas-confetti is not supported
    }
  }, [recipe.id, isCustomCreated]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5 note
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
        osc.stop(audioCtx.currentTime + 1.2);
      } catch {
        // Audio API fallback
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  // Reset timer when recipe changes
  useEffect(() => {
    setTimeLeft(recipe.cooking_time_minutes * 60);
    setIsTimerRunning(false);
  }, [recipe.id, recipe.cooking_time_minutes]);

  // Format timer MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `วันนี้ทำเมนู "${recipe.title}" (${recipe.calories} kcal) ใช้เวลาทำ ${recipe.cooking_time_minutes} นาที!`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.4)',
            color: '#FFFFFF',
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          <X size={18} />
        </button>

        {/* Hero Image & Tags Header */}
        <div style={{ position: 'relative', height: 260, width: '100%', overflow: 'hidden' }}>
          <img
            src={recipe.image_url}
            alt={recipe.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
          }} />

          {/* Badge overlays */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}>
            {isCustomCreated ? (
              <span style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              }}>
                <Wand2 size={13} />
                ✨ เชฟคิดค้นพิเศษเฉพาะคุณ
              </span>
            ) : (
              <span style={{
                background: matchPercentage === 100 ? '#10B981' : '#F59E0B',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Sparkles size={12} />
                {matchPercentage === 100 ? 'ของครบ 100%' : `ตรง ${matchPercentage}%`}
              </span>
            )}

            <span style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
            }}>
              ความยาก: {recipe.difficulty}
            </span>
          </div>

          {/* Title & Info on Image */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            right: 20,
            color: '#FFFFFF',
          }}>
            <h2 style={{
              fontSize: '1.65rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {recipe.title}
            </h2>
            <p style={{
              fontSize: '0.88rem',
              opacity: 0.92,
              marginTop: 4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Chef Tip Card (if generated by chef) */}
          {chefTip && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <Sparkles size={18} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: 1.5, fontWeight: 500 }}>
                {chefTip}
              </div>
            </div>
          )}

          {/* Quick Metrics Bar (Calories, Time, Tags) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10,
            marginBottom: 20,
          }}>
            {/* Calories Calculation */}
            <div style={{
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#C2410C',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
                <Flame size={14} /> พลังงานรวม
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EA580C', marginTop: 2 }}>
                {recipe.calories} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>kcal</span>
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#9A3412',
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
                marginTop: 2,
              }}>
                <span>P:{recipe.protein_g}g</span>
                <span>C:{recipe.carbs_g}g</span>
                <span>F:{recipe.fat_g}g</span>
              </div>
            </div>

            {/* Cooking Time */}
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#1E40AF',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}>
                <Clock size={14} /> เวลาปรุงอาหาร
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>
                {recipe.cooking_time_minutes} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>นาที</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#1E40AF', marginTop: 2 }}>
                {recipe.cooking_time_minutes <= 15 ? '⚡ เมนูด่วนทันใจ' : '⏳ ปรุงอย่างพิถีพิถัน'}
              </div>
            </div>

            {/* Tags Pill Container */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--border)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 4,
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                แท็กประจำเมนู:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {recipe.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: 'var(--text-body)',
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 1: Ingredients Breakdown */}
          <div style={{ marginBottom: 22 }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <Utensils size={16} color="var(--primary)" />
              <span>ตรวจเช็ควัตถุดิบ (Ingredients Checklist)</span>
            </h3>

            {/* Missing alert if any */}
            {missingIngredients.length > 0 && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <AlertTriangle size={18} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.84rem', color: '#991B1B' }}>
                  <strong>วัตถุดิบที่ยังขาด ({missingIngredients.length} อย่าง): </strong>
                  <span>{missingIngredients.map(m => m.name).join(', ')}</span>
                  <div style={{ fontSize: '0.76rem', color: '#B91C1C', marginTop: 2 }}>
                    💡 สามารถหาซื้อเพิ่ม หรือปรับใช้วัตถุดิบทดแทนตามสะดวกได้ครับ
                  </div>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 12,
            }}>
              {/* Available items */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#166534',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>มีในตู้เย็นแล้ว ({availableIngredients.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {availableIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.84rem',
                        color: '#14532D',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {availableIngredients.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: '#65A30D' }}>ยังไม่มีในตู้</span>
                  )}
                </div>
              </div>

              {/* Missing items */}
              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#92400E',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <ShoppingBag size={16} color="#D97706" />
                  <span>ต้องเตรียมเพิ่ม / ขาด ({missingIngredients.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {missingIngredients.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.84rem',
                        color: '#78350F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.76rem', color: '#92400E', fontWeight: 500 }}>
                          {item.amount || (item.isOptional ? '(ใส่หรือไม่ก็ได้)' : '')}
                        </span>
                        {onAddIngredientToFridge && (
                          <button
                            type="button"
                            onClick={() => onAddIngredientToFridge(item.id)}
                            title="กดเพื่อระบุว่ามีวัตถุดิบนี้แล้ว และนำใส่ตู้เย็น"
                            style={{
                              background: '#FEF3C7',
                              border: '1px solid #FDE68A',
                              color: '#92400E',
                              borderRadius: 4,
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Plus size={11} />
                            <span>ใส่ตู้</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {missingIngredients.length === 0 && (
                    <div style={{ fontSize: '0.84rem', color: '#16A34A', fontWeight: 600 }}>
                      🎉 วัตถุดิบครบถ้วน 100% พร้อมลงมือทำได้ทันที!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Step-by-Step Cooking Steps */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 10,
            }}>
              👨‍🍳 ขั้นตอนวิธีทำ (Instructions)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recipe.steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    background: '#F8FAFC',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: isCustomCreated ? '#10B981' : 'var(--primary)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {index + 1}
                  </div>
                  <div style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.5,
                  }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: Meal Logger Box (บันทึกเมนูนี้ที่กินไป) */}
          <div style={{
            background: '#FFF7ED',
            border: '1.5px dashed #FDBA74',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#C2410C',
              }}>
                <Flame size={18} color="#EA580C" />
                <span>โหมดคำนวณแคลฯ สรุปรายมื้อ: บันทึกเมนูที่กินไป</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {[
                  { id: 'breakfast', label: 'มื้อเช้า 🌅' },
                  { id: 'lunch', label: 'มื้อเที่ยง ☀️' },
                  { id: 'dinner', label: 'มื้อเย็น 🌙' },
                  { id: 'snack', label: 'ของว่าง 🦉' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMealType(m.id as MealType)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.74rem',
                      fontWeight: selectedMealType === m.id ? 700 : 500,
                      background: selectedMealType === m.id ? '#EA580C' : '#FFFFFF',
                      color: selectedMealType === m.id ? '#FFFFFF' : '#7C2D12',
                      border: '1px solid #FDBA74',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLogMeal && onLogMeal(recipe, selectedMealType)}
              disabled={isMealLogged}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isMealLogged ? '#10B981' : 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: '#FFFFFF',
                padding: '9px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 800,
                boxShadow: '0 3px 10px rgba(234, 88, 12, 0.25)',
                cursor: isMealLogged ? 'default' : 'pointer',
              }}
            >
              {isMealLogged ? <Check size={16} /> : <Plus size={16} />}
              <span>{isMealLogged ? 'บันทึกเข้ายอดวันนี้แล้ว!' : `+ บันทึกที่กินไป (${recipe.calories} kcal)`}</span>
            </button>
          </div>

          {/* Section 4: Interactive Cooking Timer & Video Link */}
          <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '2rem',
                fontWeight: 800,
                color: timeLeft === 0 ? '#10B981' : '#F8FAFC',
                letterSpacing: '0.05em',
              }}>
                {formatTime(timeLeft)}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>นาฬิกานับเวลาปรุงอาหาร</div>
                <div style={{ fontSize: '0.72rem', color: timeLeft === 0 ? '#34D399' : '#94A3B8' }}>
                  {timeLeft === 0 ? '🔔 เสร็จเรียบร้อย พร้อมเสิร์ฟ!' : 'กดปุ่มเพื่อเริ่มจับเวลาทำอาหาร'}
                </div>
              </div>
            </div>

            {/* Timer controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{
                  background: isTimerRunning ? '#EF4444' : 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                {isTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                <span>{isTimerRunning ? 'หยุดชั่วคราว' : 'เริ่มจับเวลา'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimeLeft(recipe.cooking_time_minutes * 60);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                <span>รีเซ็ต</span>
              </button>

              {recipe.video_url && (
                <a
                  href={recipe.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Video size={16} />
                  <span>ดูคลิปวิธีทำ</span>
                </a>
              )}
            </div>
          </div>

          {/* Action Footer Buttons (Reroll, Save Recipe, Cook Done, Share) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}>
            {/* Left action: Reroll or Save */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onReroll}
                disabled={!canReroll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: canReroll ? '#FFF7ED' : '#F1F5F9',
                  color: canReroll ? '#EA580C' : '#94A3B8',
                  border: `1px solid ${canReroll ? '#FFD8A8' : '#CBD5E1'}`,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: canReroll ? 'pointer' : 'not-allowed',
                }}
              >
                <RotateCw size={16} />
                <span>🔄 ยังไม่โดนใจ สุ่มใหม่!</span>
              </button>

              {/* Save Recipe Button */}
              {onSaveRecipe && (
                <button
                  type="button"
                  onClick={() => onSaveRecipe(recipe)}
                  disabled={isSaved}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: isSaved ? '#ECFDF5' : '#FEF3C7',
                    color: isSaved ? '#047857' : '#B45309',
                    border: `1px solid ${isSaved ? '#A7F3D0' : '#FDE68A'}`,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isSaved ? 'default' : 'pointer',
                  }}
                >
                  {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                  <span>{isSaved ? 'บันทึกเข้าคลังแล้ว!' : '⭐ บันทึกเข้าคลัง'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                title="คัดลอกข้อความแชร์เมนูนี้"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  color: 'var(--text-body)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={16} />
                <span>{copied ? 'คัดลอกแล้ว!' : 'แชร์'}</span>
              </button>

              {/* Cook Done */}
              <button
                type="button"
                onClick={() => onCookDone(recipe)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, var(--primary) 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(255, 100, 34, 0.3)',
                  cursor: 'pointer',
                }}
              >
                <Utensils size={17} />
                <span>ทำเมนูนี้เลย! (ตัดสต็อก)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
