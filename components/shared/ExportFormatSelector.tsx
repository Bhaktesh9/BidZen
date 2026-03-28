'use client';

import React from 'react';
import { Button } from '@/components/shared/Button';

interface ExportFormatSelectorProps {
  onExportExcel: () => void;
  isLoading?: boolean;
  label?: string;
}

export function ExportFormatSelector({
  onExportExcel,
  isLoading = false,
  label = 'Export',
}: ExportFormatSelectorProps) {
  return (
    <Button
      variant="secondary"
      onClick={onExportExcel}
      disabled={isLoading}
      className="w-full sm:w-auto text-xs sm:text-sm"
    >
      {label} (Excel)
    </Button>
  );
}
