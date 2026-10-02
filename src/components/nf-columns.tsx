import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { NfCadastroFlat } from '@/types/nf';
import { User, CheckCircle2, XCircle, Clock, Ban, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

const columnHelper = createColumnHelper<NfCadastroFlat>();

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const formatDate = (dateStr: string) => {
  try {
    if (!dateStr) return '---';
    if (dateStr.includes('/')) return dateStr;
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
};

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'faturado' || s === 'concluido' || s === 'f' || s === 'autorizado' || s === 'a') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-[10px] font-black tracking-tight uppercase ">
        <CheckCircle2 size={10} />
        {status}
      </span>
    );
  }
  if (s === 'cancelado' || s === 'c') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-full text-[10px] font-black tracking-tight uppercase ">
        <XCircle size={10} />
        {status}
      </span>
    );
  }
  if (s === 'denegado' || s === 'd') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 rounded-full text-[10px] font-black tracking-tight uppercase ">
        <Ban size={10} />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-[10px] font-black tracking-tight uppercase ">
      <Clock size={10} />
      {status || 'Pendente'}
    </span>
  );
};

export const getNfColumns = () => [
  columnHelper.accessor('data_emissao', {
    header: 'Emissão',
    cell: info => <span className="text-xs font-medium text-zinc-400 font-mono">{formatDate(info.getValue())}</span>,
  }),
  columnHelper.accessor('numero_nf', {
    header: 'NF-e No.',
    cell: info => <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">#{info.getValue()}</span>,
  }),
  columnHelper.accessor('serie', {
    header: 'Série / Mod.',
    cell: info => (
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-900 dark:text-white font-mono uppercase tracking-tight">S: {info.getValue()}</span>
        <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-mono italic">M: {info.row.original.modelo || '55'}</span>
      </div>
    ),
  }),
  columnHelper.accessor('razao_social', {
    header: 'Destinatário / Cliente',
    cell: info => (
      <div className="flex items-center gap-2">
        <User size={12} className="text-slate-400 dark:text-zinc-600" />
        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">
          {info.getValue()}
        </span>
      </div>
    ),
  }),
  columnHelper.accessor('cnpj_cpf', {
    header: 'Doc. Cliente',
    cell: info => <span className="text-[10px] font-bold text-zinc-500 font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor('natureza_operacao', {
    header: 'Nat. Operação',
    cell: info => <span className="text-xs text-zinc-400 max-w-[150px] truncate block">{info.getValue()}</span>,
  }),
  columnHelper.accessor('valor_total_nf', {
    header: 'Valor Líquido',
    cell: info => <span className="text-sm font-black text-slate-900 dark:text-white group-hover/row:text-blue-600 dark:text-blue-400 transition-colors uppercase">{formatCurrency(info.getValue())}</span>,
    meta: { align: 'right' }
  }),
  columnHelper.accessor('status_nf', {
    header: 'Status',
    cell: info => getStatusBadge(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Ações',
    cell: info => (
      <div className="flex justify-center opacity-0 group-hover/row:opacity-100 transition-all translate-x-1 group-hover/row:translate-x-0">
        <Link 
          href={`/nf/${info.row.original.id_nf}`}
          className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20" 
          title="Abrir Detalhes"
        >
          <Eye size={14} />
        </Link>
      </div>
    ),
    meta: { align: 'center' }
  }),
];
