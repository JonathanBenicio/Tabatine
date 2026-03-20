'use client';

import React, { useMemo } from 'react';
import { useClienteStore, ClienteCadastro } from '@/store/useClienteStore';
import { Search, Users as UsersIcon, AlertCircle, RefreshCw, Eye, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';
import Pagination from './Pagination';
import { useRouter } from 'next/navigation';
import { useClientesQuery } from '@/hooks/useClientesQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<ClienteCadastro>();

export default function ClientesTable() {
  const router = useRouter();
  const { 
    currentPage, totalPaginas, totalRegistros, 
    searchTerm, setSearchTerm, setCurrentPage 
  } = useClienteStore();

  const { data, isLoading, error, refetch } = useClientesQuery(currentPage, searchTerm);

  const columns = useMemo(() => [
    columnHelper.accessor('razao_social', {
      header: 'Empresa / Razão Social',
      cell: info => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white tracking-tight group-hover/row:text-indigo-400 transition-colors">
              {info.getValue()}
            </span>
            {info.row.original.optante_simples_nacional && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-tighter">
                Simples
              </span>
            )}
          </div>
          {info.row.original.nome_fantasia && info.row.original.nome_fantasia !== info.getValue() && (
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{info.row.original.nome_fantasia}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('cnpj_cpf', {
      header: 'Documento / IE',
      cell: info => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-300 font-mono tracking-tighter">{info.getValue() || '---'}</span>
          {info.row.original.inscricao_estadual && (
            <span className="text-[10px] text-zinc-500 font-mono">IE: {info.row.original.inscricao_estadual}</span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'localizacao',
      header: 'Localização',
      cell: info => (
        <div className="flex items-center gap-2 text-zinc-400 group-hover/row:text-zinc-300 transition-colors">
          <MapPin size={12} className="text-zinc-600" />
          <span className="text-xs">{info.row.original.cidade} / {info.row.original.estado}</span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'contato',
      header: 'Contato',
      cell: info => (
        <div className="flex flex-col gap-1">
          {info.row.original.telefone1_numero && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Phone size={10} className="text-zinc-600" />
              <span>({info.row.original.telefone1_ddd}) {info.row.original.telefone1_numero}</span>
            </div>
          )}
          {info.row.original.email && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Mail size={10} className="text-zinc-600" />
              <span className="truncate max-w-[150px]">{info.row.original.email}</span>
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: info => {
        const tags = info.getValue() || [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[9px] font-bold uppercase tracking-tighter">
                {t.tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[9px] text-zinc-600 font-bold">+{tags.length - 2}</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: info => (
        <div className="flex justify-center opacity-0 group-hover/row:opacity-100 transition-all translate-x-1 group-hover/row:translate-x-0">
          <button 
            onClick={() => router.push(`/clientes/${info.row.original.codigo_cliente_omie}`)}
            className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20" 
            title="Perfil do Cliente"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
      meta: { align: 'center' }
    }),
  ], [router]);

  const table = useReactTable({
    data: data?.clientes || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <UsersIcon size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Gestão de Clientes
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-md">Base de clientes sincronizada diretamente do Omie ERP.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar clientes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-indigo-500/40 rounded-xl text-sm placeholder:text-zinc-600 outline-none w-full lg:w-72 transition-all focus:ring-4 focus:ring-indigo-500/5 backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-2.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Simples Nacional</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tighter">
              {data?.clientes?.filter(c => c.optante_simples_nacional).length || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Na página atual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Erro ao carregar clientes</p>
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
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-32"></div></td>
                    <td className="py-5 px-6"><div className="h-6 bg-zinc-800/50 rounded-full w-20"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-10 mx-auto"></div></td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 group/icon">
                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover/icon:text-zinc-500 transition-colors">
                        <UsersIcon size={32} />
                      </div>
                      <p className="text-zinc-400 font-medium">Nenhum cliente encontrado</p>
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

        {/* Loading Overlay */}
        {isLoading && data && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center z-20">
            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-4">Sincronizando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
