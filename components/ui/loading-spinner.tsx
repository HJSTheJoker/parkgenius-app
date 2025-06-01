import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  white: 'text-white',
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className,
  label = 'Loading...'
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4" role="status" aria-label={label}>
      <svg
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-muted-foreground">Loading ParkGenius...</p>
      </div>
    </div>
  );
}

export function InlineLoadingSpinner({ className }: { className?: string }) {
  return (
    <LoadingSpinner 
      size="sm" 
      className={cn('inline-block', className)} 
      label="Loading content"
    />
  );
}