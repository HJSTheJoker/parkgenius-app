import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        error:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        info:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        // Theme park specific variants
        'wait-low':
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'wait-medium':
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'wait-high':
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        'wait-extreme':
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'thrill-1':
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'thrill-2':
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'thrill-3':
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'thrill-4':
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        'thrill-5':
          'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        accessibility:
          'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

// Specialized badge components for theme park use
export function WaitTimeBadge({ minutes, className }: { minutes: number; className?: string }) {
  const variant = 
    minutes === 0 ? 'wait-low' :
    minutes <= 15 ? 'wait-low' :
    minutes <= 30 ? 'wait-medium' :
    minutes <= 60 ? 'wait-high' : 'wait-extreme';

  const text = minutes === 0 ? 'Walk On' : `${minutes} min`;

  return (
    <Badge variant={variant} className={className}>
      {text}
    </Badge>
  );
}

export function ThrillLevelBadge({ level, className }: { level: number; className?: string }) {
  const variant = `thrill-${level}` as any;
  const labels = {
    1: 'Family Friendly',
    2: 'Mild Thrill',
    3: 'Moderate Thrill',
    4: 'High Thrill',
    5: 'Extreme Thrill',
  };

  return (
    <Badge variant={variant} className={className}>
      {labels[level as keyof typeof labels] || 'Unknown'}
    </Badge>
  );
}

export function AccessibilityBadge({ feature, className }: { feature: string; className?: string }) {
  return (
    <Badge variant="accessibility" className={className}>
      {feature}
    </Badge>
  );
}

export { Badge, badgeVariants };