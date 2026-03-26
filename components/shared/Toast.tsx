'use client';

import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const typeStyles = {
    success: 'border-success/50 text-textPrimary',
    error: 'border-danger/50 text-textPrimary',
    warning: 'border-warning/50 text-textPrimary',
    info: 'border-primary/50 text-textPrimary',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`bg-gradient-to-r from-elevated to-card border ${typeStyles[type]} px-5 py-3 rounded-smpanel shadow-2xl shadow-black/30 animate-fade-in font-mono text-xs tracking-wide flex items-center gap-2`}>
      <span className={`w-2 h-2 rounded-full ${
        type === 'success'
          ? 'bg-success'
          : type === 'error'
          ? 'bg-danger'
          : type === 'warning'
          ? 'bg-warning'
          : 'bg-primary'
      }`} />
      {message}
    </div>
  );
}

/**
 * Toast container for managing multiple toasts
 */
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>;
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}
