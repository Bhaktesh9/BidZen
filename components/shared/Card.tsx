'use client';

import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bz-panel p-6 shadow-xl shadow-black/20 hover:border-primary/25 hover:shadow-primary/5 ${className}`}>
      {title && <h2 className="text-xl font-display font-bold mb-4 text-textPrimary">{title}</h2>}
      {children}
    </div>
  );
}
