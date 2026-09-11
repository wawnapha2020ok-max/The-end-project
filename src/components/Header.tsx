'use client';

import React from 'react';
import { ChefHat, Database, Refrigerator, Flame, Dices } from 'lucide-react';

interface HeaderProps {
  fridgeCount: number;
  stapleCount: number;
  todayCalories: number;
  calorieGoal: number;
  isSupabase: boolean;
  onOpenSupabaseModal: () => void;
  onOpenCalorieDrawer: () => void;
  onOpenSpinningWheel: () => void;
}

export default function Header({
  fridgeCount,
  stapleCount,
  todayCalories,
  calorieGoal,
  isSupabase,
  onOpenSupabaseModal,
  onOpenCalorieDrawer,
  onOpenSpinningWheel,
}: HeaderProps) {
  const caloriePercent = Math.min((todayCalories / calorieGoal) * 100, 100);
  const isNearGoal = caloriePercent >= 80;

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(10px)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(255, 100, 34, 0.3)',
            flexShrink: 0,
          }}>
            <ChefHat size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}>
              กินอะไรดี <span style={{ color: 'var(--primary)' }}>POS</span>
            </h1>
            {/* Hide subtitle on very small screens */}
            <p className="header-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              ตู้เย็นอัจฉริยะ • คิดเมนู • แคลอรี่
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>

          {/* Spinning Wheel Button */}
          <button
            type="button"
            onClick={onOpenSpinningWheel}
            title="วงล้อเสี่ยงทาย"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
              color: '#E11D48',
              border: '1px solid #FDA4AF',
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span>🎡</span>
            <span className="hide-on-mobile">วงล้อ</span>
          </button>

          {/* Daily Calorie Tracker */}
          <button
            type="button"
            onClick={onOpenCalorieDrawer}
            title="สมุดบันทึกแคลอรี่วันนี้"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: isNearGoal ? '#FEF2F2' : '#FFF7ED',
              color: isNearGoal ? '#DC2626' : '#EA580C',
              border: `1px solid ${isNearGoal ? '#FCA5A5' : '#FFD8A8'}`,
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Flame size={14} />
            <span><strong>{todayCalories}</strong><span className="hide-on-mobile">/{calorieGoal} kcal</span></span>
          </button>

          {/* Fridge Count Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            <Refrigerator size={14} />
            <span><strong>{fridgeCount}</strong></span>
          </div>

          {/* Supabase status button - hide label on mobile */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            title="ตั้งค่า Supabase Database"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: isSupabase ? '#ECFDF5' : '#F8FAFC',
              color: isSupabase ? '#047857' : '#475569',
              border: `1px solid ${isSupabase ? '#A7F3D0' : '#CBD5E1'}`,
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Database size={13} color={isSupabase ? '#10B981' : '#64748B'} />
            <span className="hide-on-mobile">{isSupabase ? 'Supabase' : 'Demo DB'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Calorie Progress Bar */}
      <div className="show-on-mobile" style={{
        height: 3,
        background: '#F1F5F9',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${caloriePercent}%`,
          background: isNearGoal
            ? 'linear-gradient(90deg, #EF4444, #F97316)'
            : 'linear-gradient(90deg, var(--primary), var(--accent))',
          transition: 'width 0.4s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>
    </header>
  );
}
