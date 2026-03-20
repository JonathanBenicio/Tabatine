'use client';

import React, { useMemo } from 'react';
import { useProdutosStore, Produto } from '@/store/useProdutosStore';
import { 
  Search, 
  Package, 
  Filter, 
  ArrowUpDown,
  FileDown,
  RefreshCcw,
  Tag,
  Hash,
  Eye
} from 'lucide-react';
import Pagination from './Pagination';
import { useRouter } from 'next/navigation';
import { useProdutosQuery } from '@/hooks/useProdutosQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<Produto>();

export default function ProdutosTable() {
  const router = useRouter();
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage 
  } = useProdutosStore();

  const { data, isLoading, error, refetch } = useProdutosQuery(currentPage, searchTerm);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns = useMemo(() => [
    columnHelper.accessor('descricao', {
      header: 'Produto',
      cell: info => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all border border-zinc-800/50">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{info.getValue()}</p>
            <div className="flex items-center gap-2 mt-1">
               <Tag className="w-3 h-3 text-zinc-600" />
               <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight">Omie Ref: {info.row.original.codigo_produto}</span>
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('codigo', {
      header: 'SKU / Cód.',
      cell: info => (
        <div className="flex items-center gap-2">
           <Hash className="w-3.5 h-3.5 text-zinc-600" />
           <span className="text-sm font-mono text-zinc-400 whitespace-nowrap">{info.getValue() || '--'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('unidade', {
      header: 'Unidade',
      cell: info => (
        <span className="px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-800 text-xs font-medium text-zinc-400">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('valor_unitario', {
      header: 'Preço Unitário',
      cell: info => (
        <span className="text-sm font-bold text-emerald-400">
          {formatCurrency(info.getValue())}
        </span>
      ),
      meta: { align: 'right' }
    }),
    columnHelper.accessor('ncm', {
      header: 'NCM',
      cell: info => (
        <span className="text-sm text-zinc-500 font-medium">
          {info.getValue() || '--'}
        </span>
      ),
    }),
    columnHelper.accessor('excluido', {
      header: 'Status',
      cell: info => (
        <div className="flex items-center justify-center">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${info.getValue() === 'N' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {info.getValue() === 'N' ? 'Ativo' : 'Excluído'}
          </span>
        </div>
      ),
      meta: { align: 'center' }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: info => (
        <div className="flex items-center justify-center">
          <button 
            onClick={() => router.push(`/produtos/${info.row.original.codigo_produto}`)}
            className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
            title="Ver Detalhes"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      meta: { align: 'center' }
    }),
  ], [router]);

  const table = useReactTable({
    data: data?.produtos || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou SKU..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtrar</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
            <FileDown className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''}`}
                    >
                      <div className={`flex items-center gap-2 ${header.column.columnDef.meta?.align === 'right' ? 'justify-end' : header.column.columnDef.meta?.align === 'center' ? 'justify-center' : ''}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.id === 'descricao' && <ArrowUpDown className="w-3 h-3 group-hover:text-blue-400" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isLoading && !data ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={columns.length} className="px-6 py-8">
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-full max-w-xs bg-zinc-800 animate-pulse rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-medium">
            Mostrando <span className="text-zinc-300">{data?.produtos.length || 0}</span> de <span className="text-zinc-300">{data?.totalRegistros || 0}</span> produtos
          </p>
          <Pagination
            currentPage={currentPage}
            totalPaginas={data?.totalPaginas || 1}
            onPageChange={setCurrentPage}
            loading={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <p className="text-sm text-rose-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Erro: {(error as Error).message}
          </p>
        </div>
      )}
    </div>
  );
}
