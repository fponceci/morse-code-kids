'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
  darkMode?: boolean;
}

export function Navbar({ title, showBack = false, darkMode = false }: NavbarProps) {
  const router = useRouter();

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-sm border-b-2 ${
      darkMode
        ? 'bg-morse-navy/95 border-white/10'
        : 'bg-morse-cream/90 border-morse-purple/10'
    }`}>
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-lg ${
              darkMode
                ? 'bg-white/10 text-white'
                : 'bg-morse-purple/10 text-morse-purple'
            }`}
          >
            ←
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl">📡</span>
          </Link>
        )}
        {title && (
          <h1 className={`font-black text-lg flex-1 text-center ${
            darkMode ? 'text-white' : 'text-morse-navy'
          }`}>
            {title}
          </h1>
        )}
        <div className="w-9" /> {/* spacer to center title */}
      </div>
    </header>
  );
}
