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
  hideFooter?: boolean;
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
  hideFooter = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-subtle rounded-[20px] shadow-2xl shadow-black/40 w-full max-w-[520px] max-h-[88vh] overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="border-b border-subtle px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-display font-bold text-textPrimary truncate">{title}</h2>
          <Button
            variant="logout"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 min-w-[72px]"
          >
            Close
          </Button>
        </div>
        <div className="px-4 sm:px-5 py-4 overflow-y-auto">{children}</div>
        {!hideFooter && (
          <div className="border-t border-subtle px-4 sm:px-5 py-3 flex justify-end gap-2">
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
        )}
      </div>
    </div>
  );
}
