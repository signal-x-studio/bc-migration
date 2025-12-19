import { HTMLAttributes, forwardRef } from 'react';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantStyles = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, showLabel = false, size = 'md', variant = 'default', className = '', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-1.5">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-slate-300">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizeStyles[size]}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${variantStyles[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

const circularVariantStyles = {
  default: 'stroke-blue-500',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  danger: 'stroke-red-500',
};

export const CircularProgress = ({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
}: CircularProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`transition-all duration-300 ease-out ${circularVariantStyles[variant]}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-medium text-slate-300">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// Multi-step progress for batch assessment
interface StepProgressProps {
  steps: { label: string; status: 'pending' | 'active' | 'complete' | 'error' }[];
}

export const StepProgress = ({ steps }: StepProgressProps) => {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${step.status === 'complete' ? 'bg-green-500 text-white' : ''}
            ${step.status === 'active' ? 'bg-blue-500 text-white' : ''}
            ${step.status === 'error' ? 'bg-red-500 text-white' : ''}
            ${step.status === 'pending' ? 'bg-slate-700 text-slate-400' : ''}
          `}>
            {step.status === 'complete' ? '✓' : step.status === 'error' ? '!' : index + 1}
          </div>
          <span className={`text-sm ${step.status === 'pending' ? 'text-slate-500' : 'text-slate-300'}`}>
            {step.label}
          </span>
          {step.status === 'active' && (
            <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};
