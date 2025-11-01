import React, { useMemo } from 'react';
import { Spinner } from './spinner';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  id?: string;
}

const variantClasses = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
  secondary:
    'bg-transparent text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
  ghost:
    'bg-transparent text-foreground !px-0 !py-0 border-none hover:text-foreground',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[40px] sm:min-h-[36px]', // Ensure mobile touch target
  md: 'px-4 py-2 text-sm', // Standard touch target
  lg: 'px-6 py-2 text-sm', // Larger touch target
};

const disabledClasses = 'opacity-50 cursor-not-allowed';

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    children,
    onClick,
    type = 'button',
    className = '',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-pressed': ariaPressed,
    id,
  }) => {
    const isDisabled = disabled || loading;

    // Memoized class computation
    const buttonClasses = useMemo(() => {
      const classes = [
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-md border border-border',
        'transition-colors duration-200',
        'focus:outline-none cursor-pointer shadow-xs hover:text-primary',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && disabledClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return classes;
    }, [variant, size, isDisabled, className]);

    return (
      <button
        id={id}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-pressed={ariaPressed}
        aria-busy={loading}
      >
        {loading && (
          <>
            <Spinner size={size === 'lg' ? 'md' : 'sm'} aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </>
        )}
        {children}
      </button>
    );
  }
);
