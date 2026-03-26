'use client';

import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-card border border-subtle rounded-[20px] shadow-2xl shadow-black/40 max-w-md w-full mx-4 overflow-hidden">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="border-b border-subtle px-6 py-4">
          <h2 className="text-xl font-display font-bold text-textPrimary">{title}</h2>
        </div>
        <div className="px-6 py-4">{children}</div>
        <div className="border-t border-subtle px-6 py-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              variant={isDangerous ? 'danger' : 'primary'}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
