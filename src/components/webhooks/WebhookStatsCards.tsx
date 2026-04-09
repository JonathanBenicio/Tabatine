'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Zap, RotateCcw } from 'lucide-react';
import type { WebhookStats } from '@/types/webhook';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  className: string;
  iconClass: string;
  subValue?: string;
}

function StatCard({ icon, label, value, className, iconClass, subValue }: StatCardProps) {
  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 ${className}`}>
      <div className={`p-3 rounded-xl ${iconClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
        {subValue && <p className="text-[10px] text-zinc-500">{subValue}</p>}
      </div>
    </div>
  );
}

interface WebhookStatsCardsProps {
  stats: WebhookStats;
}

export function WebhookStatsCards({ stats }: WebhookStatsCardsProps) {
  const lastEventLabel = stats.lastEventAt
    ? formatDistanceToNow(new Date(stats.lastEventAt), { addSuffix: true, locale: ptBR })
    : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        icon={<Clock size={18} className="text-white" />}
        label="Pendentes"
        value={stats.pending}
        className="bg-zinc-900/50 border-zinc-800/50"
        iconClass="bg-slate-600/50"
      />
      <StatCard
        icon={<Zap size={18} className="text-blue-300" />}
        label="Processando"
        value={stats.processing}
        className="bg-blue-500/5 border-blue-500/20"
        iconClass="bg-blue-500/20"
      />
      <StatCard
        icon={<AlertTriangle size={18} className="text-orange-300" />}
        label="Com Falha"
        value={stats.failed}
        className="bg-orange-500/5 border-orange-500/20"
        iconClass="bg-orange-500/20"
      />
      <StatCard
        icon={<XCircle size={18} className="text-rose-300" />}
        label="Dead Letter"
        value={stats.deadLetter}
        className={`border ${stats.deadLetter > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-zinc-900/50 border-zinc-800/50'}`}
        iconClass={stats.deadLetter > 0 ? 'bg-rose-500/30' : 'bg-zinc-700/50'}
      />
      <StatCard
        icon={<CheckCircle2 size={18} className="text-emerald-300" />}
        label="Concluídos Hoje"
        value={stats.completedToday}
        className="bg-emerald-500/5 border-emerald-500/20"
        iconClass="bg-emerald-500/20"
      />
      <StatCard
        icon={<RotateCcw size={18} className="text-zinc-400" />}
        label="Último Evento"
        value={lastEventLabel ?? '—'}
        className="bg-zinc-900/50 border-zinc-800/50"
        iconClass="bg-zinc-700/50"
        subValue={stats.lastEventAt ? new Date(stats.lastEventAt).toLocaleDateString('pt-BR') : undefined}
      />
    </div>
  );
}
