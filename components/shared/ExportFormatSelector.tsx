'use client';

import React from 'react';
import { Button } from '@/components/shared/Button';

interface ExportFormatSelectorProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
  label?: string;
}

export function ExportFormatSelector({
  onExportExcel,
  onExportPDF,
  isLoading = false,
  label = 'Export',
}: ExportFormatSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="secondary"
        onClick={onExportExcel}
        disabled={isLoading}
        className="w-full sm:w-auto text-xs sm:text-sm"
      >
        {label} (Excel)
      </Button>
      <Button
        variant="secondary"
        onClick={onExportPDF}
        disabled={isLoading}
        className="w-full sm:w-auto text-xs sm:text-sm"
      >
        {label} (PDF)
      </Button>
    </div>
  );
}
