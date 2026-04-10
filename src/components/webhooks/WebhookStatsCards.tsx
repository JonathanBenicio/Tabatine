'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Zap, RotateCcw } from 'lucide-react';
import type { WebhookStats } from '@/types/webhook';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TableSummaryCard } from '@/components/ui/TableSummaryCard';

interface WebhookStatsCardsProps {
  stats: WebhookStats;
}

export function WebhookStatsCards({ stats }: WebhookStatsCardsProps) {
  const lastEventLabel = stats.lastEventAt
    ? formatDistanceToNow(new Date(stats.lastEventAt), { addSuffix: true, locale: ptBR })
    : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <TableSummaryCard
        title="Pendentes"
        value={stats.pending}
        icon={Clock}
        variant="indigo"
      />
      <TableSummaryCard
        title="Processando"
        value={stats.processing}
        icon={Zap}
        variant="blue"
      />
      <TableSummaryCard
        title="Com Falha"
        value={stats.failed}
        icon={AlertTriangle}
        variant="orange"
      />
      <TableSummaryCard
        title="Dead Letter"
        value={stats.deadLetter}
        icon={XCircle}
        variant="rose"
        description={stats.deadLetter > 0 ? "Ação necessária" : undefined}
      />
      <TableSummaryCard
        title="Concluídos Hoje"
        value={stats.completedToday}
        icon={CheckCircle2}
        variant="emerald"
      />
      <TableSummaryCard
        title="Último Evento"
        value={lastEventLabel ?? '—'}
        icon={RotateCcw}
        variant="slate"
        description={stats.lastEventAt ? format(new Date(stats.lastEventAt), 'dd/MM/yyyy HH:mm') : undefined}
      />
    </div>
  );
}

import { format } from 'date-fns';
