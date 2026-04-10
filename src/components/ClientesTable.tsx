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
import { TableContainer } from '@/components/ui/TableContainer';
import { TableSearch } from '@/components/ui/TableSearch';
import { TableSummaryCard } from '@/components/ui/TableSummaryCard';

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
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">
              {info.getValue()}
            </span>
            {info.row.original.optante_simples_nacional && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-tighter">
                Simples
              </span>
            )}
          </div>
          {info.row.original.nome_fantasia && info.row.original.nome_fantasia !== info.getValue() && (
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-medium uppercase tracking-wider">{info.row.original.nome_fantasia}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('cnpj_cpf', {
      header: 'Documento / IE',
      cell: info => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 font-mono tracking-tighter">{info.getValue() || '---'}</span>
          {info.row.original.inscricao_estadual && (
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">IE: {info.row.original.inscricao_estadual}</span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'localizacao',
      header: 'Localização',
      cell: info => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 group-hover/row:text-slate-700 dark:group-hover/row:text-zinc-300 transition-colors">
          <MapPin size={12} className="text-slate-400 dark:text-zinc-600" />
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
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Phone size={10} className="text-slate-400 dark:text-zinc-600" />
              <span>({info.row.original.telefone1_ddd}) {info.row.original.telefone1_numero}</span>
            </div>
          )}
          {info.row.original.email && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              <Mail size={10} className="text-slate-400 dark:text-zinc-600" />
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
              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 rounded text-[9px] font-bold uppercase tracking-tighter">
                {t.tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-bold">+{tags.length - 2}</span>
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
    <div className="w-full space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard 
          icon={UsersIcon}
          label="Total de Clientes"
          value={data?.totalRegistros || 0}
          isLoading={isLoading}
          variant="blue"
        />
        <TableSummaryCard 
          icon={ShieldCheck}
          label="Simples Nacional"
          value={data?.clientes?.filter(c => c.optante_simples_nacional).length || 0}
          sublabel="Na página atual"
          isLoading={isLoading}
          variant="emerald"
        />
      </div>

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Gestão de Clientes
            {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />}
          </h2>
          <p className="text-slate-500 dark:text-zinc-500 font-medium max-w-md">
            Base estratégica de clientes integrada em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Pesquisar clientes..."
            isLoading={isLoading}
          />
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-3 bg-white/50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
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
            <p className="font-bold tracking-tight">Erro ao carregar clientes</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer
        isLoading={isLoading && !data}
        isEmpty={table.getRowModel().rows.length === 0}
        emptyMessage="Nenhum cliente encontrado"
        emptyIcon={UsersIcon}
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
                className="group/row hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-all duration-300"
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

        {/* Sync Status for users already seeing content */}
        {isLoading && data && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl border border-indigo-500/20 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Sincronizando...</span>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
