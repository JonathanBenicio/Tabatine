'use client';

import React, { useMemo } from 'react';
import { useContasCorrentesStore, ContaCorrente } from '@/store/useContasCorrentesStore';
import { Banknote, AlertCircle, RefreshCw, Eye, Building2, CreditCard, Ban, CheckCircle2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';
import { useContasCorrentesQuery } from '@/hooks/useContasCorrentesQuery';
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

const columnHelper = createColumnHelper<ContaCorrente>();

export default function ContasCorrentesTable() {
  const router = useRouter();
  const { 
    currentPage, searchTerm, sorting, setSearchTerm, setCurrentPage, setSorting 
  } = useContasCorrentesStore();

  const { data, isLoading, error, refetch } = useContasCorrentesQuery(currentPage, searchTerm, sorting);

  const columns = useMemo(() => [
    columnHelper.accessor('descricao', {
      header: 'Descrição / Nome',
      cell: info => (
        <div className="flex flex-col gap-0.5" onClick={() => router.push(`/contas-correntes/${info.row.original.nCodCC}`)}>
          <span className="text-sm font-bold text-slate-700 dark:text-white tracking-tight group-hover/row:text-emerald-600 dark:group-hover/row:text-emerald-400 transition-colors cursor-pointer">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'bancoAgencia',
      header: 'Banco / Agência',
      cell: info => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-300">
            <Building2 size={12} className="text-emerald-600 dark:text-emerald-500" />
            <span>Banco: {info.row.original.codigo_banco || '---'}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium tracking-wider uppercase ml-5">Ag: {info.row.original.codigo_agencia || '---'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('numero_conta_corrente', {
      header: 'Número da Conta',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <CreditCard size={12} className="text-slate-300 dark:text-zinc-600" />
          <span className="text-xs font-mono">{info.getValue() || '---'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('tipo', {
      header: 'Tipo',
      cell: info => (
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
          {info.getValue()}
        </span>
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
            onClick={() => router.push(`/contas-correntes/${info.row.original.nCodCC}`)}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg shadow-emerald-500/20" 
            title="Abrir Detalhes"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
      meta: { align: 'center' }
    }),
  ], [router]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.contas || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
    },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Banknote size={20} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Contas Correntes
            </h2>
          </div>
          <p className="text-slate-500 dark:text-zinc-500 text-sm max-w-md">Contas bancárias e caixas sincronizados do Omie ERP.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none">
            <TableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Pesquisar contas..."
              isLoading={isLoading}
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-2.5 bg-white/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm shadow-sm dark:shadow-none"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard
          label="Total de Contas"
          value={data?.totalRegistros || 0}
          sublabel="Registradas"
          icon={Banknote}
          variant="emerald"
          isLoading={isLoading && !data}
        />

        <TableSummaryCard
          label="Saldo Inicial (Total)"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            data?.contas?.reduce((sum, c) => sum + (c.saldo_inicial || 0), 0) || 0
          )}
          sublabel="Soma base formativa"
          icon={Building2}
          variant="blue"
          isLoading={isLoading && !data}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Erro ao carregar contas</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer
        isLoading={isLoading && !data}
        isEmpty={!isLoading && table.getRowModel().rows.length === 0}
        emptyMessage="Nenhuma conta encontrada"
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
              <tr key={headerGroup.id} className="border-b border-slate-200/60 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/20">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className={`py-5 px-6 text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-sans ${header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''} ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-emerald-500 transition-colors' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className={`flex items-center gap-2 ${header.column.columnDef.meta?.align === 'center' ? 'justify-center' : ''}`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="text-slate-300 dark:text-zinc-700">
                          {{
                            asc: <ChevronUp size={12} className="text-emerald-500" />,
                            desc: <ChevronDown size={12} className="text-emerald-500" />,
                          }[header.column.getIsSorted() as string] ?? <ChevronsUpDown size={12} className="opacity-0 group-hover:opacity-100" />}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="group/row hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-all duration-300"
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
      </TableContainer>


    </div>
  );
}
