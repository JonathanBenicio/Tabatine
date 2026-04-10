'use client';

import React, { useMemo } from 'react';
import { useFinanceiroStore } from '@/store/useFinanceiroStore';
import { useFinanceiroQuery } from '@/hooks/useFinanceiroQuery';
import { TituloFinanceiro } from '@/lib/financeiro-mapper';
import { 
  Search, Banknote, AlertCircle, RefreshCw, CheckCircle2, 
  XCircle, Clock, Hash, User, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Pagination from './Pagination';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { TableContainer } from '@/components/ui/TableContainer';
import { TableSearch } from '@/components/ui/TableSearch';
import { TableSummaryCard } from '@/components/ui/TableSummaryCard';

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
    <div className="w-full space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard 
          icon={Banknote}
          label="Total de Títulos"
          value={data?.totalRegistros || 0}
          isLoading={isLoading}
          variant="blue"
        />
        <TableSummaryCard 
          icon={type === 'pagar' ? ArrowUpRight : ArrowDownLeft}
          label={type === 'pagar' ? 'Total a Pagar' : 'Total a Receber'}
          value={data?.titulos?.reduce((acc, curr) => acc + (curr.valor_saldo || 0), 0) || 0}
          isCurrency
          isLoading={isLoading}
          variant={type === 'pagar' ? 'rose' : 'emerald'}
        />
      </div>

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {type === 'pagar' ? 'Contas a Pagar' : 'Contas a Receber'}
            {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />}
          </h2>
          <p className="text-slate-500 dark:text-zinc-500 font-medium max-w-md">
            Monitoramento em tempo real do fluxo de {type === 'pagar' ? 'saídas' : 'entradas'}.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Localizar ${type === 'pagar' ? 'fornecedor' : 'cliente'}...`}
            isLoading={isLoading}
          />
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-3 bg-white/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
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

      <TableContainer
        isLoading={isLoading && !data}
        isEmpty={table.getRowModel().rows.length === 0}
        emptyMessage="Nenhum título financeiro encontrado"
        emptyIcon={Banknote}
        pagination={
          <Pagination 
            currentPage={currentPage}
            totalPaginas={data?.totalPaginas || 1}
            onPageChange={setCurrentPage}
            loading={isLoading}
          />
        }
      >
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="group/row hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-5 px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
}
