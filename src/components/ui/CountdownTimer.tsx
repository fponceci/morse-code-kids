'use client';

import { motion } from 'framer-motion';

interface CountdownTimerProps {
  total: number;    // total seconds
  remaining: number; // remaining seconds
  size?: number;
}

export function CountdownTimer({ total, remaining, size = 80 }: CountdownTimerProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const strokeDashoffset = circumference * (1 - progress);
  const color = progress > 0.5 ? '#0D9488' : progress > 0.25 ? '#F59E0B' : '#F43F5E';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <span className="absolute text-xl font-black text-morse-navy" style={{ fontSize: size * 0.28 }}>
        {Math.ceil(remaining)}
      </span>
    </div>
  );
}
