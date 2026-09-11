import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';

const promptFont = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'กินอะไรดี POS - ตู้เย็นอัจฉริยะ & ระบบสุ่มเมนูอาหารจากวัตถุดิบ',
  description: 'ระบบสุ่มเมนูอาหารและจัดการตู้เย็นอัจฉริยะ ตรวจสอบวัตถุดิบที่มีและขาด คำนวณแคลอรี แนะนำเมนูที่ทำได้ทันทีหรือซื้อเพิ่มแค่ 1 อย่าง',
  keywords: ['กินอะไรดี', 'สูตรอาหาร', 'สุ่มเมนู', 'ตู้เย็น', 'คำนวณแคลอรี', 'ทำอาหาร', 'POS อาหาร'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={promptFont.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FF6422" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
