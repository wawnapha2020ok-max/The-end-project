'use client';

import React, { useState, useEffect } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export default function SupabaseModal({
  isOpen,
  onClose,
  onConfigSaved,
}: SupabaseModalProps) {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupabaseUrl(localStorage.getItem('SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
      setSupabaseAnonKey(localStorage.getItem('SUPABASE_ANON_KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('SUPABASE_URL', supabaseUrl.trim());
      localStorage.setItem('SUPABASE_ANON_KEY', supabaseAnonKey.trim());
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onConfigSaved();
        onClose();
      }, 1000);
    }
  };

  const handleCopySql = () => {
    const sqlScript = `-- รันใน Supabase SQL Editor:
-- ดูโค้ดแบบเต็มได้ในไฟล์ supabase/schema.sql ในโปรเจกต์`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sqlScript);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
          maxWidth: 580,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: '24px 28px',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            background: '#ECFDF5',
            color: '#10B981',
            padding: 8,
            borderRadius: 'var(--radius-md)',
          }}>
            <Database size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              การเชื่อมต่อ Supabase Database
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              รองรับทั้งโหมด Offline Demo และเชื่อมต่อฐานข้อมูลจริงบนคลาวด์
            </p>
          </div>
        </div>

        {/* Step 1: SQL Schema */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>ขั้นตอนที่ 1: ติดตั้ง Table และข้อมูลสูตรอาหาร</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
              ไฟล์ supabase/schema.sql
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            เปิดโปรเจกต์ของคุณใน Supabase Dashboard &gt; เข้าไปที่ <strong>SQL Editor</strong> &gt; วางโค้ดจากไฟล์ <code>supabase/schema.sql</code> แล้วกด <strong>Run</strong>
          </p>
          <button
            type="button"
            onClick={handleCopySql}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {copiedSql ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            <span>{copiedSql ? 'คัดลอกตำแหน่งไฟล์แล้ว' : 'ไฟล์ SQL พร้อมใช้งานใน supabase/schema.sql'}</span>
          </button>
        </div>

        {/* Step 2: Configure Keys */}
        <form onSubmit={handleSave}>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: 10,
          }}>
            ขั้นตอนที่ 2: ระบุ URL และ Anon Key ของคุณ
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
              Supabase Project URL:
            </label>
            <input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
              Supabase Anon Key:
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>ไปที่ Supabase Console</span>
              <ExternalLink size={13} />
            </a>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ปิด
              </button>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={16} />
                <span>{isSaved ? 'บันทึกสำเร็จ!' : 'บันทึกการเชื่อมต่อ'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Vercel Tip */}
        <div style={{
          marginTop: 18,
          paddingTop: 12,
          borderTop: '1px dashed var(--border)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          🚀 <strong>สำหรับการ Deploy บน Vercel:</strong> นำค่า <code>NEXT_PUBLIC_SUPABASE_URL</code> และ <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ไปเพิ่มใน Vercel Project Settings &gt; <strong>Environment Variables</strong> ได้ทันที
        </div>
      </div>
    </div>
  );
}
