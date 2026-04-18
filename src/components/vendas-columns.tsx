import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { VendaPlana } from '@/store/useVendasStore';
import { User, Package, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const columnHelper = createColumnHelper<VendaPlana>();

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === '--') return '--';
  try {
    if (dateStr.includes('/')) return dateStr; 
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
};

const etapaMap: Record<string, { label: string; color: string }> = {
  '10': { label: 'Pedido', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(59,130,246,0.1)]' },
  '20': { label: 'Separar', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(234,179,8,0.1)]' },
  '30': { label: 'Faturar', color: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.1)]' },
  '50': { label: 'Faturado', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.1)]' },
  '60': { label: 'Entregue', color: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(20,184,166,0.1)]' },
  '70': { label: 'Cancelado', color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(244,63,94,0.1)]' },
  '80': { label: 'Devolvido', color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 shadow-sm dark:shadow-[0_0_10px_rgba(239,68,68,0.1)]' },
};

const formatEtapa = (etapa: string) => {
  const mapped = etapaMap[etapa];
  if (mapped) return mapped;
  return { label: etapa || 'Pendente', color: 'text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700' };
};

export const getVendasColumns = (
  getClienteNome: (id: string | number) => string,
  getVendedorNome: (id: string | number) => string,
  getContaNome: (id: string | number) => string,
  onNavigate: (id: string | number) => void
) => [
  columnHelper.accessor('data', {
    header: '📅 DATA',
    cell: (info) => <span className="text-xs font-mono text-zinc-400">{formatDate(info.getValue())}</span>,
  }),
  columnHelper.accessor('cliente', {
    header: '👥 CLIENTE',
    id: 'cliente',
    cell: (info) => (
      <div className="flex items-center gap-2 group-hover/row:translate-x-1 transition-transform">
        <User size={12} className="text-slate-400 dark:text-zinc-600" />
        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover/row:text-orange-500 dark:group-hover/row:text-orange-400 transition-colors">
          {getClienteNome(info.getValue() || '')}
        </span>
      </div>
    ),
    minSize: 220,
  }),
  columnHelper.accessor('vendedor', {
    header: '👤 VENDEDOR',
    cell: (info) => <span className="text-[11px] text-zinc-400 font-medium">{getVendedorNome(info.getValue() || '')}</span>,
    minSize: 150,
  }),
  columnHelper.accessor('pedido', {
    header: '📦 PEDIDO',
    cell: (info) => <span className="text-[11px] font-black text-orange-500/80 bg-orange-500/5 px-2 py-0.5 rounded-lg border border-orange-500/10">#{info.getValue()}</span>,
  }),
  columnHelper.accessor('nf', {
    header: '📄 NF',
    cell: (info) => <span className="text-[11px] text-zinc-500 font-mono">{info.getValue() || '---'}</span>,
  }),
  columnHelper.accessor('produto', {
    header: '🛒 PRODUTO',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Package size={12} className="text-slate-400 dark:text-zinc-600" />
        <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[180px]">{info.getValue()}</span>
      </div>
    ),
    minSize: 200,
  }),
  columnHelper.accessor('und', {
    header: '📦 UND',
    cell: (info) => <span className="text-[11px] font-bold text-zinc-500 uppercase">{info.getValue()}</span>,
  }),
  columnHelper.accessor('valorVenda', {
    header: '💰 VALOR VENDA',
    cell: (info) => <span className="text-xs font-bold text-emerald-400">{formatCurrency(info.getValue())}</span>,
  }),
  columnHelper.accessor('condPagto', {
    header: '💳 COND. PAGTO.',
    cell: (info) => <span className="text-[11px] text-zinc-400 font-medium italic">{info.getValue()}</span>,
  }),
  columnHelper.accessor('frete', {
    header: '🚚 FRETE',
    cell: (info) => <span className="text-[11px] text-zinc-500">{formatCurrency(info.getValue())}</span>,
  }),
  columnHelper.accessor('percComissao', {
    header: '📈 COMS. %',
    cell: (info) => <span className="text-[11px] font-bold text-indigo-400">{info.getValue()}%</span>,
  }),
  columnHelper.accessor('valorTotal', {
    header: '🎯 VALOR TOTAL',
    cell: (info) => <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(info.getValue())}</span>,
  }),
  columnHelper.accessor('formaPg', {
    header: '🏦 FORMA PG',
    cell: (info) => <span className="text-[11px] text-zinc-400 uppercase tracking-tighter">{info.getValue()}</span>,
  }),
  columnHelper.accessor('banco', {
    header: '🏛️ BANCO',
    cell: (info) => <span className="text-[10px] text-zinc-500 font-medium">{getContaNome(info.getValue() || '')}</span>,
  }),
  columnHelper.accessor('vencimentoStatus', {
    header: '🚦 Status Venc.',
    cell: (info) => {
      const status = formatEtapa(info.getValue());
      return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${status.color}`}>
          {status.label}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '⚡ AÇÕES',
    cell: (info) => (
      <button 
        onClick={() => onNavigate(info.row.original.id_linha)}
        className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800/50 hover:bg-orange-500/10 dark:hover:bg-orange-500/20 text-slate-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors border border-slate-200 dark:border-zinc-700/50 hover:border-orange-500/30 group"
        title="Abrir Detalhes"
      >
        <Eye size={16} className="group-hover:scale-110 transition-transform" />
      </button>
    ),
  }),
];
