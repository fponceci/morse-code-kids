'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'coral' | 'teal' | 'yellow' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-morse-purple text-white shadow-[0_6px_0_#5B21B6] hover:shadow-[0_3px_0_#5B21B6] hover:translate-y-[3px]',
  secondary: 'bg-white text-morse-purple border-4 border-morse-purple shadow-[0_6px_0_#5B21B6] hover:shadow-[0_3px_0_#5B21B6] hover:translate-y-[3px]',
  coral: 'bg-morse-coral text-white shadow-[0_6px_0_#E11D48] hover:shadow-[0_3px_0_#E11D48] hover:translate-y-[3px]',
  teal: 'bg-morse-teal text-white shadow-[0_6px_0_#0F766E] hover:shadow-[0_3px_0_#0F766E] hover:translate-y-[3px]',
  yellow: 'bg-morse-yellow text-morse-navy shadow-[0_6px_0_#D97706] hover:shadow-[0_3px_0_#D97706] hover:translate-y-[3px]',
  ghost: 'bg-transparent text-morse-purple border-2 border-morse-purple/30 hover:bg-morse-purple/10',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-3xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={clsx(
        'font-bold transition-all duration-100 active:translate-y-[6px] active:shadow-none no-select',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
