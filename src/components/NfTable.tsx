'use client';

import React, { useMemo, useTransition } from 'react';
import { useNfStore } from '@/store/useNfStore';
import { FileText, AlertCircle, RefreshCw, ShieldCheck, DollarSign, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';
import { useSuspenseNfQuery } from '@/hooks/useNfQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { TableContainer } from '@/components/ui/TableContainer';
import { TableSearch } from '@/components/ui/TableSearch';
import { TableSummaryCard } from '@/components/ui/TableSummaryCard';
import { getNfColumns } from './nf-columns';

export default function NfTable() {
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage,
    sorting, setSorting
  } = useNfStore();

  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    startTransition(() => {
      setSearchTerm(term);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
    });
  };

  const { data, error, refetch } = useSuspenseNfQuery(currentPage, searchTerm, sorting);

  const stats = useMemo(() => {
    const nfs = data.nfs || [];
    const faturados = nfs.filter(n => ['faturado', 'autorizado'].includes(n.status_nf.toLowerCase()));
    const cancelados = nfs.filter(n => n.status_nf.toLowerCase() === 'cancelado');
    const totalFaturado = faturados.reduce((sum, n) => sum + (n.valor_total_nf || 0), 0);
    const totalCancelado = cancelados.reduce((sum, n) => sum + (n.valor_total_nf || 0), 0);
    return { faturados: faturados.length, cancelados: cancelados.length, totalFaturado, totalCancelado };
  }, [data.nfs]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data.nfs || [],
    columns: getNfColumns(),
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      startTransition(() => {
        setSorting(updater);
      });
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  return (
    <div className={`w-full space-y-8 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard 
          icon={FileText}
          label="NF-e Processadas"
          value={data?.totalRegistros || 0}
          sublabel="Sincronização Ativa"
          isLoading={isPending}
          variant="blue"
        />
        <TableSummaryCard 
          icon={DollarSign}
          label="Total Faturado"
          value={stats.totalFaturado}
          sublabel={`${stats.faturados} notas na página`}
          isCurrency
          isLoading={isPending}
          variant="emerald"
        />
        <TableSummaryCard 
          icon={ShieldCheck}
          label="Impostos (Pág.)"
          value={data?.nfs?.reduce((sum, n) => sum + (n.valor_pis || 0) + (n.valor_cofins || 0) + (n.valor_icms || 0), 0) || 0}
          sublabel="PIS + COFINS + ICMS"
          isCurrency
          isLoading={isPending}
          variant="purple"
        />
      </div>

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Central de Notas Fiscais
            {isPending && <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />}
          </h2>
          <p className="text-slate-500 dark:text-zinc-500 font-medium max-w-md">
            Controle absoluto sobre suas emissões e faturamentos Omie.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Localizar NF-e ou cliente..."
            isLoading={isPending}
          />
          <button 
            onClick={() => refetch()} 
            disabled={isPending}
            className="p-3 bg-white/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-5 h-5 ${isPending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
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
        isLoading={false}
        isEmpty={table.getRowModel().rows.length === 0}
        emptyMessage="Nenhum registro sincronizado"
        emptyIcon={FileText}
        pagination={
          <Pagination 
            currentPage={currentPage}
            totalPaginas={data?.totalPaginas || 1}
            onPageChange={handlePageChange}
            loading={isPending}
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
        {isPending && data && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-blue-500/20 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Sincronizando...</span>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
