'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface NavbarProps {
  title?: string;
  showBack?: boolean;
}

export function Navbar({ title, showBack = false }: NavbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-morse-cream/90 backdrop-blur-sm border-b-2 border-morse-purple/10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-2xl bg-morse-purple/10 flex items-center justify-center font-bold text-morse-purple text-lg"
          >
            ←
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl">📡</span>
          </Link>
        )}
        {title && (
          <h1 className="font-black text-morse-navy text-lg flex-1 text-center">
            {title}
          </h1>
        )}
        <div className="w-9" /> {/* spacer to center title */}
      </div>
    </header>
  );
}
