'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'logout';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-display font-semibold rounded-smpanel transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 border';

  const variantStyles = {
    primary: 'bg-primary text-base border-primary/70 hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-card text-textSecondary border-subtle hover:bg-elevated hover:text-textPrimary focus:ring-primary',
    danger: 'bg-danger/12 text-danger border-danger/35 hover:bg-danger/18 focus:ring-danger',
    success: 'bg-success/12 text-success border-success/35 hover:bg-success/18 focus:ring-success',
    logout: 'bg-card text-danger border-danger/35 hover:bg-danger/10 hover:border-danger/60 hover:text-danger focus:ring-danger',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
