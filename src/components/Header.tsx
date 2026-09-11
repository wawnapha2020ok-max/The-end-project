'use client';

import React from 'react';
import { ChefHat, Database, Refrigerator, Sparkles, CheckCircle2, Flame, Dices } from 'lucide-react';

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
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(255, 100, 34, 0.3)',
          }}>
            <ChefHat size={25} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                กินอะไรดี <span style={{ color: 'var(--primary)' }}>POS</span>
              </h1>
              <span style={{
                background: 'var(--accent-light)',
                color: 'var(--accent-dark)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Sparkles size={11} /> Smart Kitchen
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ระบบคิดเมนูจากวัตถุดิบในตู้เย็น • วงล้อเสี่ยงทาย • บันทึกแคลอรี่รายวัน
            </p>
          </div>
        </div>

        {/* Right Stats & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Spinning Wheel Button */}
          <button
            type="button"
            onClick={onOpenSpinningWheel}
            title="เปิดวงล้อเสี่ยงทายสุ่มเมนูประจำวัน"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
              color: '#E11D48',
              border: '1px solid #FDA4AF',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.1)',
            }}
          >
            <span>🎡</span>
            <span>วงล้อสุ่มประจำวัน</span>
          </button>

          {/* Daily Calorie Tracker Badge */}
          <button
            type="button"
            onClick={onOpenCalorieDrawer}
            title="คลิกเพื่อดูสมุดบันทึกแคลอรี่วันนี้"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFF7ED',
              color: '#EA580C',
              border: '1px solid #FFD8A8',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Flame size={15} color="#EA580C" />
            <span>วันนี้: <strong>{todayCalories}</strong>/{calorieGoal} kcal</span>
          </button>

          {/* Fridge Count Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}>
            <Refrigerator size={15} />
            <span>มีของ: <strong>{fridgeCount}</strong></span>
          </div>

          {/* Supabase status button */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            title="คลิกเพื่อตั้งค่า Supabase Database"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isSupabase ? '#ECFDF5' : '#F8FAFC',
              color: isSupabase ? '#047857' : '#475569',
              border: `1px solid ${isSupabase ? '#A7F3D0' : '#CBD5E1'}`,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Database size={14} color={isSupabase ? '#10B981' : '#64748B'} />
            <span>{isSupabase ? 'Supabase' : 'Demo DB'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
