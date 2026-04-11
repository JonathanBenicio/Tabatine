import React from 'react';
import { LucideIcon, RefreshCw } from 'lucide-react';

interface TableSummaryCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'orange' | 'purple' | 'rose' | 'amber' | 'pink' | 'success' | 'danger';
  isCurrency?: boolean;
  isLoading?: boolean;
}

export function TableSummaryCard({
  label,
  value,
  sublabel,
  icon: Icon,
  variant = 'orange',
  isCurrency = false,
  isLoading = false
}: TableSummaryCardProps) {
  
  const variants = {
    blue: 'text-blue-500 hover:border-blue-500/30',
    emerald: 'text-emerald-500 hover:border-emerald-500/30',
    orange: 'text-orange-500 hover:border-orange-500/30',
    purple: 'text-purple-500 hover:border-purple-500/30',
    rose: 'text-rose-500 hover:border-rose-500/30',
    amber: 'text-amber-500 hover:border-amber-500/30',
    pink: 'text-pink-500 hover:border-pink-500/30',
    success: 'text-emerald-500 hover:border-emerald-500/30',
    danger: 'text-rose-500 hover:border-rose-500/30',
  };

  const formatValue = (val: string | number) => {
    if (isCurrency && typeof val === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }
    return val;
  };

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-white/60 dark:border-zinc-800/40 backdrop-blur-xl animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800"></div>
        </div>
        <div className="h-8 w-32 bg-slate-200 dark:bg-zinc-800 rounded mt-2"></div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-white/60 dark:border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group ${variants[variant]} transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-lg bg-current opacity-10"></div>
          <Icon size={16} className="relative z-10" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{formatValue(value)}</p>
        </div>
        {sublabel && (
          <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
