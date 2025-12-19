import { HTMLAttributes, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onDismiss?: () => void;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string; title: string }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    title: 'text-blue-300',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    title: 'text-green-300',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    title: 'text-yellow-300',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    title: 'text-red-300',
  },
};

const icons: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, onDismiss, className = '', children, ...props }, ref) => {
    const styles = variantStyles[variant];
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={`
          relative flex gap-3 p-4 rounded-lg border
          ${styles.bg} ${styles.border}
          ${className}
        `}
        {...props}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h4>
          )}
          <div className="text-sm text-slate-300">{children}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// Inline alert for form validation messages
export const InlineAlert = ({ variant = 'error', children }: { variant?: AlertVariant; children: React.ReactNode }) => {
  const styles = variantStyles[variant];
  const Icon = icons[variant];

  return (
    <div className={`flex items-center gap-2 text-sm ${styles.icon}`}>
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
};
