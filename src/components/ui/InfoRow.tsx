// src/components/ui/InfoRow.tsx
import React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className = 'text-slate-600 dark:text-zinc-300' }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-zinc-800/30 last:border-0">
      <span className="text-xs text-slate-500 dark:text-zinc-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ml-4 ${className}`}>{value}</span>
    </div>
  );
}
