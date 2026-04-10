'use client';

import React, { useMemo } from 'react';
import { useVendedoresStore, Vendedor } from '@/store/useVendedoresStore';
import { Search, UserCheck, AlertCircle, RefreshCw, Eye, Mail, Percent, Ban, CheckCircle2 } from 'lucide-react';
import Pagination from './Pagination';
import { useVendedoresQuery } from '@/hooks/useVendedoresQuery';
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

const columnHelper = createColumnHelper<Vendedor>();

export default function VendedoresTable() {
  const router = useRouter();
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage 
  } = useVendedoresStore();

  const { data, isLoading, error, refetch } = useVendedoresQuery(currentPage, searchTerm);

  const columns = useMemo(() => [
    columnHelper.accessor('nome', {
      header: 'Vendedor / Nome',
      cell: info => (
        <div className="flex flex-col gap-0.5" onClick={() => router.push(`/vendedores/${info.row.original.codigo}`)}>
          <span className="text-sm font-bold text-slate-700 dark:text-white tracking-tight group-hover/row:text-blue-500 transition-colors cursor-pointer">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('codigo', {
      header: 'Código',
      cell: info => (
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 font-mono">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 group-hover/row:text-slate-700 dark:group-hover/row:text-zinc-400 transition-colors">
            <Mail size={10} className="text-slate-300 dark:text-zinc-700" />
            <span className="text-[10px] truncate max-w-[150px]">{info.getValue() || '---'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('comissao', {
      header: 'Comissão',
      cell: info => (
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
          <Percent size={12} className="text-slate-300 dark:text-zinc-600" />
          <span className="text-xs font-semibold">{info.getValue()}%</span>
        </div>
      ),
    }),
    columnHelper.accessor('inativo', {
      header: 'Status',
      cell: info => (
        <div className="flex justify-center">
          {info.getValue() === 'S' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider">
              <Ban size={10} />
              Inativo
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
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
            onClick={() => router.push(`/vendedores/${info.row.original.codigo}`)}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20" 
            title="Ver Detalhes"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
      meta: { align: 'center' }
    }),
  ], []);

  const table = useReactTable({
    data: data?.vendedores || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
              <UserCheck size={20} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Listagem de Vendedores
            </h2>
          </div>
          <p className="text-slate-500 dark:text-zinc-500 text-sm max-w-md">Equipe de vendas sincronizada diretamente do Omie ERP.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Pesquisar vendedores..."
            isLoading={isLoading}
          />
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-3 bg-white/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm shadow-sm dark:shadow-none"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard
          label="Total de Vendedores"
          value={data?.totalRegistros || 0}
          sublabel="Equipe Cadastrada"
          icon={UserCheck}
          variant="blue"
          isLoading={isLoading}
        />

        <TableSummaryCard
          label="Média Comissão"
          value={`${((data?.vendedores || []).reduce((sum, v) => sum + (v.comissao || 0), 0) / (data?.vendedores?.length || 1)).toFixed(1)}%`}
          sublabel="Média da equipe"
          icon={Percent}
          variant="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Erro ao carregar vendedores</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer
        isLoading={isLoading && !data}
        isEmpty={table.getRowModel().rows.length === 0}
        emptyMessage="Nenhum vendedor encontrado"
        emptyIcon={UserCheck}
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
