import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  color?: 'white' | 'purple' | 'teal' | 'yellow' | 'coral';
}

const colorClasses = {
  white: 'bg-white border-2 border-morse-purple/10',
  purple: 'bg-morse-purple/10 border-2 border-morse-purple/20',
  teal: 'bg-morse-teal/10 border-2 border-morse-teal/20',
  yellow: 'bg-morse-yellow/10 border-2 border-morse-yellow/30',
  coral: 'bg-morse-coral/10 border-2 border-morse-coral/20',
};

export function Card({ children, className, color = 'white' }: CardProps) {
  return (
    <div className={clsx('rounded-3xl p-5 shadow-sm', colorClasses[color], className)}>
      {children}
    </div>
  );
}
