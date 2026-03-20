'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/translator', label: 'Translate', emoji: '🔤' },
  { href: '/listen', label: 'Learn', emoji: '📖' },
  { href: '/games', label: 'Games', emoji: '🎮' },
  { href: '/flash', label: 'Flash', emoji: '🔦' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-morse-purple/10 safe-b">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ href, label, emoji }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-bold transition-colors no-select',
                active ? 'text-morse-purple' : 'text-morse-navy/40'
              )}
            >
              <span className={clsx('text-2xl transition-transform', active && 'scale-110')}>
                {emoji}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
