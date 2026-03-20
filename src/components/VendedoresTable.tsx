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
          <span className="text-sm font-bold text-white tracking-tight group-hover/row:text-blue-400 transition-colors cursor-pointer">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('codigo', {
      header: 'Código',
      cell: info => (
        <span className="text-xs font-medium text-zinc-400 font-mono">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => (
        <div className="flex items-center gap-2 text-zinc-500 group-hover/row:text-zinc-400 transition-colors">
            <Mail size={10} className="text-zinc-700" />
            <span className="text-[10px] truncate max-w-[150px]">{info.getValue() || '---'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('comissao', {
      header: 'Comissão',
      cell: info => (
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Percent size={12} className="text-zinc-600" />
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
            className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20" 
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
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <UserCheck size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Listagem de Vendedores
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-md">Equipe de vendas sincronizada diretamente do Omie ERP.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar vendedores..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-blue-500/40 rounded-xl text-sm placeholder:text-zinc-600 outline-none w-full lg:w-72 transition-all focus:ring-4 focus:ring-blue-500/5 backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-2.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total de Vendedores</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <UserCheck size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tighter">{data?.totalRegistros || 0}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Cadastrados</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Média Comissão</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Percent size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tighter">
              {((data?.vendedores || []).reduce((sum, v) => sum + (v.comissao || 0), 0) / (data?.vendedores?.length || 1)).toFixed(1)}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Média da equipe</span>
            </div>
          </div>
        </div>
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
      <div className="group relative rounded-3xl border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/20">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`py-5 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-sans ${header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {isLoading && !data ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-48"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-24"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-32"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-10"></div></td>
                    <td className="py-5 px-6"><div className="h-6 bg-zinc-800/50 rounded-full w-20 mx-auto"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-10 mx-auto"></div></td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 group/icon">
                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover/icon:text-zinc-500 transition-colors">
                        <UserCheck size={32} />
                      </div>
                      <p className="text-zinc-400 font-medium">Nenhum vendedor encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="group/row hover:bg-zinc-800/30 transition-all duration-300"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-5 px-6 text-xs font-medium text-zinc-400 font-mono">
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

        {/* Loading Overlay */}
        {isLoading && data && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center z-20">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-4">Sincronizando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
