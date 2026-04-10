'use client';

import React, { useMemo } from 'react';
import { useFinanceiroStore } from '@/store/useFinanceiroStore';
import { useFinanceiroQuery } from '@/hooks/useFinanceiroQuery';
import { TituloFinanceiro } from '@/lib/financeiro-mapper';
import { 
  Search, Banknote, AlertCircle, RefreshCw, CheckCircle2, 
  XCircle, Clock, Hash, User, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Pagination from './Pagination';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<TituloFinanceiro>();

interface FinanceiroTableProps {
  type: 'pagar' | 'receber';
}

export default function FinanceiroTable({ type }: FinanceiroTableProps) {
  const { 
    pagarPage, pagarSearch, setPagarPage, setPagarSearch,
    receberPage, receberSearch, setReceberPage, setReceberSearch 
  } = useFinanceiroStore();

  const currentPage = type === 'pagar' ? pagarPage : receberPage;
  const searchTerm = type === 'pagar' ? pagarSearch : receberSearch;
  const setCurrentPage = type === 'pagar' ? setPagarPage : setReceberPage;
  const setSearchTerm = type === 'pagar' ? setPagarSearch : setReceberSearch;

  const { data, isLoading, error, refetch } = useFinanceiroQuery(type, currentPage, searchTerm);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '---';
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'baixado' || s === 'pago' || s === 'recebido' || s === 'liquidado') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-[10px] font-black tracking-tight uppercase">
          <CheckCircle2 size={10} />
          {status}
        </span>
      );
    }
    if (s === 'cancelado') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-full text-[10px] font-black tracking-tight uppercase">
          <XCircle size={10} />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-[10px] font-black tracking-tight uppercase">
        <Clock size={10} />
        {status || 'Pendente'}
      </span>
    );
  };

  const columns = useMemo(() => [
    columnHelper.accessor('data_vencimento', {
      header: 'Vencimento',
      cell: info => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{formatDate(info.getValue())}</span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">Emissão: {formatDate(info.row.original.data_emissao)}</span>
        </div>
      ),
    }),
    columnHelper.accessor('numero_documento', {
      header: 'Doc. / Parcela',
      cell: info => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">#{info.getValue()}</span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">P: {info.row.original.numero_parcela}</span>
        </div>
      ),
    }),
    columnHelper.accessor('cliente_razao_social', {
      header: type === 'pagar' ? 'Fornecedor' : 'Cliente',
      cell: info => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <User size={12} className="text-slate-500 dark:text-zinc-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">{info.getValue()}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-zinc-600 font-mono ml-5">{info.row.original.cliente_cnpj_cpf}</span>
        </div>
      ),
    }),
    columnHelper.accessor('numero_pedido', {
      header: 'Relacionado',
      cell: info => (
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-500">
          <Hash size={10} />
          <span>Ped: {info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('valor_documento', {
      header: 'Valor Bruto',
      cell: info => <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">{formatCurrency(info.getValue())}</span>,
      meta: { align: 'right' }
    }),
    columnHelper.accessor('valor_pago_recebido', {
      header: type === 'pagar' ? 'Pago' : 'Recebido',
      cell: info => (
        <span className={`text-sm font-bold ${info.getValue() > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-500'}`}>
          {formatCurrency(info.getValue())}
        </span>
      ),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('valor_saldo', {
      header: 'Saldo',
      cell: info => (
        <span className={`text-base font-black ${info.getValue() > 0 ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-600'}`}>
          {formatCurrency(info.getValue())}
        </span>
      ),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('status', {
      header: 'Situação',
      cell: info => getStatusBadge(info.getValue()),
    }),
  ], [type]);

  const table = useReactTable({
    data: data?.titulos || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${type === 'pagar' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'} border border-white/5`}>
            {type === 'pagar' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {type === 'pagar' ? 'Contas a Pagar' : 'Contas a Receber'}
            </h2>
            <p className="text-slate-500 dark:text-zinc-500 text-sm">Gerencie seu fluxo de {type === 'pagar' ? 'saídas' : 'entradas'} com precisão.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder={`Localizar título ou ${type === 'pagar' ? 'fornecedor' : 'cliente'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 focus:border-blue-500/40 rounded-xl text-sm placeholder:text-slate-500 dark:placeholder:text-zinc-600 text-slate-900 dark:text-white outline-none w-full lg:w-72 transition-all focus:ring-4 focus:ring-blue-500/5 backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-2.5 bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500 dark:text-blue-400' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Erro ao carregar dados</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="group relative rounded-3xl border border-white/60 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-lg shadow-teal-900/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-200/50 dark:border-zinc-800/50 bg-slate-100/50 dark:bg-zinc-900/20">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`py-5 px-6 text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-sans ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : ''}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-zinc-800/30">
              {isLoading && !data ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-5 px-6"><div className="h-4 bg-slate-200/50 dark:bg-zinc-800/50 rounded-md w-full"></div></td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-700">
                        <Banknote size={32} />
                      </div>
                      <p className="text-slate-500 dark:text-zinc-600 font-medium tracking-tight">Nenhum título financeiro encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="group/row hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-5 px-6">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPaginas={data?.totalPaginas || 1}
          onPageChange={setCurrentPage}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
