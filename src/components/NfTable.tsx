'use client';

import React, { useMemo } from 'react';
import { useNfStore, NfCadastroFlat } from '@/store/useNfStore';
import { Search, FileText, AlertCircle, RefreshCw, Eye, CheckCircle2, XCircle, Clock, Hash, User, ShieldCheck, DollarSign, Ban, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Pagination from './Pagination';
import Link from 'next/link';
import { useNfQuery } from '@/hooks/useNfQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { TableContainer } from '@/components/ui/TableContainer';
import { TableSearch } from '@/components/ui/TableSearch';
import { TableSummaryCard } from '@/components/ui/TableSummaryCard';

const columnHelper = createColumnHelper<NfCadastroFlat>();

export default function NfTable() {
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage,
    sorting, setSorting
  } = useNfStore();

  const { data, isLoading, error, refetch } = useNfQuery(currentPage, searchTerm, sorting);

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-[10px] font-black tracking-tight uppercase ">
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

  const stats = useMemo(() => {
    const nfs = data?.nfs || [];
    const faturados = nfs.filter(n => ['faturado', 'autorizado'].includes(n.status_nf.toLowerCase()));
    const cancelados = nfs.filter(n => n.status_nf.toLowerCase() === 'cancelado');
    const totalFaturado = faturados.reduce((sum, n) => sum + (n.valor_total_nf || 0), 0);
    const totalCancelado = cancelados.reduce((sum, n) => sum + (n.valor_total_nf || 0), 0);
    return { faturados: faturados.length, cancelados: cancelados.length, totalFaturado, totalCancelado };
  }, [data?.nfs]);

  const columns = useMemo(() => [
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
  ], []);

  const table = useReactTable({
    data: data?.nfs || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div className="w-full space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard 
          icon={FileText}
          label="NF-e Processadas"
          value={data?.totalRegistros || 0}
          sublabel="Sincronização Ativa"
          isLoading={isLoading}
          variant="blue"
        />
        <TableSummaryCard 
          icon={DollarSign}
          label="Total Faturado"
          value={stats.totalFaturado}
          sublabel={`${stats.faturados} notas na página`}
          isCurrency
          isLoading={isLoading}
          variant="emerald"
        />
        <TableSummaryCard 
          icon={ShieldCheck}
          label="Impostos (Pág.)"
          value={data?.nfs?.reduce((sum, n) => sum + (n.valor_pis || 0) + (n.valor_cofins || 0) + (n.valor_icms || 0), 0) || 0}
          sublabel="PIS + COFINS + ICMS"
          isCurrency
          isLoading={isLoading}
          variant="purple"
        />
      </div>

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Central de Notas Fiscais
            {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />}
          </h2>
          <p className="text-slate-500 dark:text-zinc-500 font-medium max-w-md">
            Controle absoluto sobre suas emissões e faturamentos Omie.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Localizar NF-e ou cliente..."
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
            <p className="font-bold tracking-tight">Falha na consulta</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer
        isLoading={isLoading && !data}
        isEmpty={table.getRowModel().rows.length === 0}
        emptyMessage="Nenhum registro sincronizado"
        emptyIcon={FileText}
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
                    className={`py-5 px-6 text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-sans ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''} ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className={`flex items-center gap-2 ${header.column.columnDef.meta?.align === 'right' ? 'justify-end' : header.column.columnDef.meta?.align === 'center' ? 'justify-center' : ''}`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="text-slate-300 dark:text-zinc-700">
                          {{
                            asc: <ChevronUp size={12} className="text-blue-500" />,
                            desc: <ChevronDown size={12} className="text-blue-500" />,
                          }[header.column.getIsSorted() as string] ?? <ChevronsUpDown size={12} className="opacity-0 group-hover:opacity-100" />}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-zinc-800/30">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="group/row hover:bg-slate-100/50 dark:hover:bg-blue-500/[0.02] transition-all duration-300"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-5 px-6 text-xs font-medium text-slate-500 dark:text-zinc-500 font-mono">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sync Status Overlay for active view */}
        {isLoading && data && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-blue-500/20 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Sincronizando...</span>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
