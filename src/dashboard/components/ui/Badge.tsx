import { HTMLAttributes, forwardRef } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-700 text-slate-200',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  outline: 'bg-transparent border border-slate-600 text-slate-300',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1
          px-2.5 py-0.5 rounded-full
          text-xs font-medium
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Convenience components for common badge types
export const StatusBadge = ({ status }: { status: 'ready' | 'warning' | 'blocker' | 'not-assessed' | 'loading' | 'info' }) => {
  const config = {
    ready: { variant: 'success' as const, label: 'Ready', icon: '✓' },
    warning: { variant: 'warning' as const, label: 'Warnings', icon: '⚠' },
    blocker: { variant: 'danger' as const, label: 'Blockers', icon: '✕' },
    'not-assessed': { variant: 'outline' as const, label: 'Not Assessed', icon: '○' },
    loading: { variant: 'info' as const, label: 'Assessing...', icon: '◌' },
    info: { variant: 'info' as const, label: 'Info', icon: 'ℹ' },
  };

  const { variant, label, icon } = config[status];

  return (
    <Badge variant={variant}>
      <span>{icon}</span>
      {label}
    </Badge>
  );
};

export const CountBadge = ({ count, type }: { count: number; type: 'blocker' | 'warning' | 'info' }) => {
  if (count === 0) return null;

  const variant = type === 'blocker' ? 'danger' : type === 'warning' ? 'warning' : 'info';

  return (
    <Badge variant={variant}>
      {count} {type}{count !== 1 ? 's' : ''}
    </Badge>
  );
};
