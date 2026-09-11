'use client';

import React from 'react';
import { FilterOptions } from '../lib/types';
import { Clock, Flame, SlidersHorizontal, Utensils } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  eligibleCount: number;
}

export default function FilterBar({
  filters,
  onChangeFilters,
  eligibleCount,
}: FilterBarProps) {
  const categories = [
    { id: 'all', label: 'ทุกประเภท' },
    { id: 'rice', label: '🍚 เมนูข้าว' },
    { id: 'noodle', label: '🍜 เมนูเส้น' },
    { id: 'soup', label: '🍲 เมนูต้ม/แกง' },
    { id: 'stir_fry', label: '🍳 เมนูผัด' },
    { id: 'fried', label: '🍗 เมนูทอด' },
    { id: 'clean', label: '🥗 คลีน/สุขภาพ' },
  ];

  const update = (partial: Partial<FilterOptions>) => {
    onChangeFilters({ ...filters, ...partial });
  };

  return (
    <section style={{
      background: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            เงื่อนไขการสุ่มเมนู (Filter Options)
          </h3>
        </div>

        <div style={{
          fontSize: '0.82rem',
          background: 'var(--accent-light)',
          color: 'var(--accent-dark)',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
        }}>
          เข้าเงื่อนไข: <strong>{eligibleCount}</strong> เมนู
        </div>
      </div>

      {/* Row 1: Category Filter */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Utensils size={14} />
          <span>ประเภทอาหาร:</span>
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {categories.map(c => {
            const isSelected = filters.category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => update({ category: c.id })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? 'var(--primary)' : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : 'var(--text-body)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Match Mode, Time Filter, Calorie Filter */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
        paddingTop: 12,
        borderTop: '1px dashed var(--border)',
      }}>
        {/* Match Mode */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            ความพร้อมของวัตถุดิบ:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'exact', label: '✅ ทำได้ทันที (100%)' },
              { id: 'missing1or2', label: '⚠️ ขาด 1-2 อย่าง' },
            ].map(m => {
              const isSelected = filters.matchMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => update({ matchMode: m.id as any })}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected ? '#FEF3C7' : '#F8FAFC',
                    color: isSelected ? '#92400E' : 'var(--text-body)',
                    border: `1px solid ${isSelected ? '#F59E0B' : 'var(--border)'}`,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cooking Time */}
        <div>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <Clock size={13} />
            <span>เวลาในการปรุง:</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all', label: 'ทุกเวลา' },
              { id: 'quick', label: '⚡ ด่วน (≤ 15 น.)' },
              { id: 'dedicated', label: '⏳ ตั้งใจทำ (> 15 น.)' },
            ].map(t => {
              const isSelected = filters.timeFilter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => update({ timeFilter: t.id as any })}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected ? '#EFF6FF' : '#F8FAFC',
                    color: isSelected ? '#1E40AF' : 'var(--text-body)',
                    border: `1px solid ${isSelected ? '#3B82F6' : 'var(--border)'}`,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calories */}
        <div>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <Flame size={13} />
            <span>คำนวณแคลอรี:</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all', label: 'ทุกแคล' },
              { id: 'low', label: '🥗 แคลต่ำ (<250)' },
              { id: 'medium', label: '🍲 ปกติ (250-550)' },
            ].map(cal => {
              const isSelected = filters.calorieFilter === cal.id;
              return (
                <button
                  key={cal.id}
                  onClick={() => update({ calorieFilter: cal.id as any })}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected ? '#ECFDF5' : '#F8FAFC',
                    color: isSelected ? '#047857' : 'var(--text-body)',
                    border: `1px solid ${isSelected ? '#10B981' : 'var(--border)'}`,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {cal.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
