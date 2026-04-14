'use client';

import React, { useEffect, useMemo } from 'react';
import { useCondicoesStore, CondicaoPlana } from '@/store/useCondicoesStore';
import { CreditCard, CalendarDays, Eye, RefreshCw, AlertCircle, Ban, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { TableContainer } from './ui/TableContainer';
import { TableSearch } from './ui/TableSearch';
import { TableSummaryCard } from './ui/TableSummaryCard';
import Pagination from './Pagination';

const columnHelper = createColumnHelper<CondicaoPlana>();

export default function CondicoesTable() {
  const router = useRouter();
  const { 
    condicoes, 
    loading, 
    error, 
    fetchCondicoes, 
    searchTerm, 
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPaginas,
    totalRegistros
  } = useCondicoesStore();

  useEffect(() => {
    fetchCondicoes(currentPage, searchTerm);
  }, [fetchCondicoes, currentPage, searchTerm]);

  const columns = useMemo(() => [
    columnHelper.accessor('codigo', {
      header: 'Código',
      cell: info => (
        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('descricao', {
      header: 'Condição de Pagamento',
      cell: info => (
        <div 
          className="flex flex-col gap-0.5 group/link cursor-pointer" 
          onClick={() => router.push(`/condicoes-pagamento/${info.row.original.id}`)}
        >
          <span className="text-sm font-bold text-slate-700 dark:text-white tracking-tight group-hover/link:text-blue-500 transition-colors">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('parcelas', {
      header: 'Parcelas',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <CalendarDays size={12} className="text-slate-300 dark:text-zinc-600" />
          <span className="text-xs font-semibold">{info.getValue()}x</span>
        </div>
      ),
      meta: { align: 'center' }
    }),
    columnHelper.accessor('ativos', {
      header: 'Status',
      cell: info => (
        <div className="flex justify-center">
          {!info.getValue() ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase tracking-wider">
              <Ban size={10} />
              Inativo
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
              <CheckCircle2 size={10} />
              Ativo
            </div>
          )}
        </div>
      ),
      meta: { align: 'center' }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: info => (
        <div className="flex justify-center opacity-0 group-hover/row:opacity-100 transition-all translate-x-1 group-hover/row:translate-x-0">
          <button 
            onClick={() => router.push(`/condicoes-pagamento/${info.row.original.id}`)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20" 
            title="Abrir Detalhes"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
      meta: { align: 'center' }
    }),
  ], [router]);

  const table = useReactTable({
    data: condicoes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <CreditCard size={20} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Condições de Pagamento
            </h2>
          </div>
          <p className="text-slate-500 dark:text-zinc-500 text-sm max-w-md">Prazos e parcelamentos para faturamento de vendas.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Pesquisar condições..."
            isLoading={loading}
          />
          <button 
            onClick={() => fetchCondicoes(currentPage)} 
            disabled={loading}
            className="p-3 bg-white/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm shadow-sm"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard
          label="Total de Condições"
          value={totalRegistros}
          sublabel="Cadastradas no ERP"
          icon={CreditCard}
          variant="blue"
          isLoading={loading && condicoes.length === 0}
        />
        <TableSummaryCard
          label="Ativas"
          value={condicoes.filter(c => c.ativos).length}
          sublabel="Disponíveis para uso"
          icon={CheckCircle2}
          variant="emerald"
          isLoading={loading && condicoes.length === 0}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Erro ao carregar condições</p>
            <p className="opacity-70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer
        isLoading={loading && condicoes.length === 0}
        isEmpty={condicoes.length === 0}
        emptyMessage="Nenhuma condição encontrada"
        emptyIcon={CreditCard}
        pagination={
          <Pagination 
            currentPage={currentPage}
            totalPaginas={totalPaginas}
            onPageChange={setCurrentPage}
            loading={loading}
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
                    className={`py-5 px-6 text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-sans ${header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''}`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
                  <td key={cell.id} className="py-5 px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sync Status Overlay */}
        {loading && condicoes.length > 0 && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-blue-500/20 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Sincronizando...</span>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
