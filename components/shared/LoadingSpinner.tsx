'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeStyles[size]}`}>
        <div className="absolute inset-0 rounded-full border border-subtle" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-gold animate-spin" />
        <div className="absolute inset-[22%] rounded-full border border-subtle/70" />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${dotSizes[size]} rounded-full bg-primary shadow-[0_0_16px_rgba(99,179,237,0.8)] animate-pulse`} />
      </div>

      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.18em] uppercase text-textSecondary">
          {message || 'Loading...'}
        </p>
      </div>
    </div>
  );
}
