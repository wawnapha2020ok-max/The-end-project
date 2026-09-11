'use client';

import React, { useState, useRef } from 'react';
import { MatchResult } from '../lib/types';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy } from 'lucide-react';

interface SpinningWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: MatchResult[];
  onSelectWinner: (match: MatchResult) => void;
}

const WHEEL_COLORS = [
  '#FF6422', // Orange
  '#FFA62B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#F59E0B', // Yellow
  '#14B8A6', // Teal
];

export default function SpinningWheelModal({
  isOpen,
  onClose,
  candidates,
  onSelectWinner,
}: SpinningWheelModalProps) {
  // Take up to 8 candidates for clear readable wedges
  const items = candidates.slice(0, 8);

  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<MatchResult | null>(null);

  if (!isOpen) return null;

  const numSlices = Math.max(items.length, 1);
  const sliceAngle = 360 / numSlices;

  const handleSpin = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Pick random winner index
    const winnerIndex = Math.floor(Math.random() * items.length);
    const winningItem = items[winnerIndex];

    // Pointer is at the top (270 deg or 0 deg depending on orientation).
    // In SVG, 0 deg is at 3 o'clock. Top (pointer) is at 270 deg (or -90 deg).
    // Slice i covers angle [i * sliceAngle, (i + 1) * sliceAngle].
    // Center of slice i is (i + 0.5) * sliceAngle.
    // To land slice center at 270 deg:
    // (rotation + sliceCenter) % 360 = 270
    // => extraRotation = 270 - sliceCenter
    const sliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
    const targetBase = (270 - sliceCenter + 360) % 360;

    // Add 5 to 7 full rotations (1800 - 2520 deg)
    const fullRounds = 360 * 6;
    const currentBase = rotation % 360;
    const addedDegrees = fullRounds + (targetBase - currentBase + 360) % 360;
    const newRotation = rotation + addedDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(winningItem);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6422', '#FFA62B', '#10B981', '#3B82F6'],
        });
      } catch {
        // fallback
      }
    }, 3800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
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
          maxWidth: 520,
          boxShadow: 'var(--shadow-lg)',
          padding: '28px 24px',
          position: 'relative',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--accent-light)',
            color: 'var(--accent-dark)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: 6,
          }}>
            <Sparkles size={13} />
            <span>วงล้อเสี่ยงทายประจำวัน (Lucky Wheel)</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            วันนี้กินอะไรดี? หมุนวงล้อตัดสินใจ!
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            สุ่มจาก {items.length} เมนูที่ทำได้จากของในตู้เย็นของคุณ
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '30px 20px', color: 'var(--text-muted)' }}>
            ยังไม่มีเมนูที่เข้าเงื่อนไข กรุณาเลือกวัตถุดิบในตู้เย็นเพิ่มก่อนนะครับ
          </div>
        ) : (
          <>
            {/* Wheel Container */}
            <div style={{ position: 'relative', width: 300, height: 300, margin: '10px 0 20px' }}>
              {/* Pointer at the top */}
              <div style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '26px solid #EF4444',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }} />

              {/* The Spinning Wheel SVG */}
              <svg
                width="300"
                height="300"
                viewBox="0 0 300 300"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                  borderRadius: '50%',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
                }}
              >
                <g transform="translate(150, 150)">
                  {items.map((item, idx) => {
                    const startAngle = (idx * sliceAngle * Math.PI) / 180;
                    const endAngle = ((idx + 1) * sliceAngle * Math.PI) / 180;
                    const midAngle = ((idx + 0.5) * sliceAngle * Math.PI) / 180;

                    const r = 145;
                    const x1 = r * Math.cos(startAngle);
                    const y1 = r * Math.sin(startAngle);
                    const x2 = r * Math.cos(endAngle);
                    const y2 = r * Math.sin(endAngle);

                    const pathData = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                    // Text position
                    const textR = 85;
                    const textX = textR * Math.cos(midAngle);
                    const textY = textR * Math.sin(midAngle);
                    const textAngle = (midAngle * 180) / Math.PI;

                    return (
                      <g key={item.recipe.id}>
                        <path
                          d={pathData}
                          fill={WHEEL_COLORS[idx % WHEEL_COLORS.length]}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                          style={{
                            userSelect: 'none',
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                          }}
                        >
                          {item.recipe.title.length > 11
                            ? item.recipe.title.substring(0, 10) + '..'
                            : item.recipe.title}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center Circle Button Decoration */}
                  <circle r="26" fill="#FFFFFF" stroke="#F1F5F9" strokeWidth="4" />
                  <circle r="18" fill="var(--primary)" />
                </g>
              </svg>
            </div>

            {/* Winner Announcement or Spin Button */}
            {winner ? (
              <div
                className="animate-pop-in"
                style={{
                  background: '#F0FDF4',
                  border: '2px solid #86EFAC',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 20px',
                  width: '100%',
                  marginTop: 6,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: '#166534',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: 4,
                }}>
                  <Trophy size={16} color="#EAB308" />
                  <span>วงล้อเลือกเมนูนี้ให้คุณ:</span>
                </div>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: 8,
                }}>
                  {winner.recipe.title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectWinner(winner);
                    }}
                    style={{
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '8px 20px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ดูวิธีทำเมนูนี้เลย 👨‍🍳
                  </button>
                  <button
                    type="button"
                    onClick={handleSpin}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: 'var(--text-body)',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    หมุนใหม่อีกรอบ 🔄
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                style={{
                  background: isSpinning ? '#94A3B8' : 'linear-gradient(135deg, #FF6422 0%, #FFA62B 100%)',
                  color: '#FFFFFF',
                  padding: '14px 38px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  boxShadow: isSpinning ? 'none' : '0 8px 24px rgba(255, 100, 34, 0.35)',
                  cursor: isSpinning ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.15s ease',
                  transform: isSpinning ? 'scale(0.96)' : undefined,
                }}
              >
                {isSpinning ? '🎡 วงล้อกำลังหมุน...' : '🎡 กดเพื่อหมุนวงล้อ!'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
