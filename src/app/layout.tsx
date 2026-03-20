import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Morse Code Kids',
  description: 'Learn Morse code through fun games and activities!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-morse-cream min-h-screen">
        <main className="max-w-lg mx-auto pb-20 min-h-screen">
          {children}
        </main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
