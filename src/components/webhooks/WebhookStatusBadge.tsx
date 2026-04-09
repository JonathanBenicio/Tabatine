'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { WebhookStatus } from '@/types/webhook';

interface StatusConfig {
  label: string;
  className: string;
  showSpinner?: boolean;
  showWarning?: boolean;
}

const STATUS_CONFIG: Record<WebhookStatus, StatusConfig> = {
  Pending: {
    label: 'Pendente',
    className: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  Processing: {
    label: 'Processando',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    showSpinner: true,
  },
  Completed: {
    label: 'Concluído',
    className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  Failed: {
    label: 'Falhou',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  DeadLetter: {
    label: 'Dead Letter',
    className: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    showWarning: true,
  },
  Dismissed: {
    label: 'Descartado',
    className: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  },
};

interface WebhookStatusBadgeProps {
  status: WebhookStatus;
  size?: 'sm' | 'md';
}

export function WebhookStatusBadge({ status, size = 'md' }: WebhookStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${config.className}`}
    >
      {config.showSpinner && (
        <Loader2 size={10} className="animate-spin shrink-0" />
      )}
      {config.showWarning && (
        <AlertTriangle size={10} className="shrink-0" />
      )}
      {config.label}
    </span>
  );
}
