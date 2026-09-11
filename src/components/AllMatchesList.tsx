'use client';

import React, { useState } from 'react';
import { MatchResult } from '../lib/types';
import { Clock, Flame, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface AllMatchesListProps {
  matches: MatchResult[];
  onSelectMatch: (match: MatchResult) => void;
}

export default function AllMatchesList({
  matches,
  onSelectMatch,
}: AllMatchesListProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (matches.length === 0) return null;

  return (
    <section style={{
      background: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.2rem' }}>📖</span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            หรือเลือกดูเมนูทั้งหมดที่ตรงเงื่อนไข ({matches.length} เมนู)
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <span>{isExpanded ? 'ย่อรายการ' : 'ดูทั้งหมด'}</span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isExpanded && (
        <div style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 14,
        }}>
          {matches.map((item) => {
            const { recipe, matchPercentage, missingIngredients } = item;
            return (
              <div
                key={recipe.id}
                onClick={() => onSelectMatch(item)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ position: 'relative', height: 130, width: '100%' }}>
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: matchPercentage === 100 ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <Sparkles size={10} />
                    {matchPercentage === 100 ? 'ของครบ' : `ตรง ${matchPercentage}%`}
                  </span>
                </div>

                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: 4,
                    }}>
                      {recipe.title}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={12} /> {recipe.cooking_time_minutes} นาที
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#C2410C' }}>
                        <Flame size={12} /> {recipe.calories} kcal
                      </span>
                    </div>
                  </div>

                  {missingIngredients.length > 0 ? (
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#B45309',
                      background: '#FFFBEB',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      ขาด: {missingIngredients.slice(0, 2).map(m => m.name).join(', ')}
                      {missingIngredients.length > 2 && ` +${missingIngredients.length - 2}`}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#16A34A',
                      background: '#F0FDF4',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                    }}>
                      พร้อมทำได้ทันที!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
