'use client';

import React, { useMemo, useState } from 'react';
import { useProdutosStore, Produto } from '@/store/useProdutosStore';
import { 
  Search, 
  Package, 
  Filter, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  RefreshCcw,
  Tag,
  Hash,
  Eye,
  CheckCircle2,
  Settings2,
  ChevronDown,
  X
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
import { exportToCSV } from '@/utils/export-utils';

const columnHelper = createColumnHelper<Produto>();

export default function ProdutosTable() {
  const router = useRouter();
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage,
    sorting, setSorting, columnVisibility, setColumnVisibility,
    filters, setFilters
  } = useProdutosStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);

  const { data, isLoading, error, refetch } = useProdutosQuery(
    currentPage, 
    searchTerm, 
    sorting, 
    filters
  );

  const formatCurrency = (value: number | string | undefined | null) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
             <Hash className="w-3.5 h-3.5 text-zinc-600" />
             <span className="text-sm font-mono text-zinc-400 whitespace-nowrap">{info.getValue() || '--'}</span>
          </div>
          {info.row.original.ean && (
            <span className="text-[10px] text-zinc-500 font-mono">EAN: {info.row.original.ean}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('familia_produto', {
      header: 'Família',
      cell: info => (
        <span className="text-xs text-zinc-400 truncate max-w-[120px] block italic">
          {info.getValue() || '--'}
        </span>
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
      header: 'Preço',
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
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  const handleExport = () => {
    if (data?.produtos) {
      const exportData = data.produtos.map(p => ({
        ID: p.codigo_produto,
        SKU: p.codigo,
        Descricao: p.descricao,
        Familia: p.familia_produto,
        Unidade: p.unidade,
        Preco: p.valor_unitario,
        NCM: p.ncm,
        Status: p.excluido === 'N' ? 'Ativo' : 'Excluído'
      }));
      exportToCSV(exportData, 'produtos_tabatine');
    }
  };

  const familaOptions = useMemo(() => {
    const families = new Set<string>();
    data?.produtos?.forEach(p => {
      if (p.familia_produto) families.add(p.familia_produto);
    });
    return Array.from(families).sort();
  }, [data?.produtos]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Produtos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Package size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tighter">{data?.totalRegistros || 0}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Base Sincronizada</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-400 tracking-tighter">
              {data?.produtos?.filter(p => p.excluido === 'N').length || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Na página atual</span>
            </div>
          </div>
        </div>
      </div>

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

        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowVisibility(!showVisibility)}
              className={`p-2.5 rounded-xl border transition-all ${showVisibility ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              title="Colunas"
            >
              <Settings2 size={18} />
            </button>
            
            {showVisibility && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Colunas</span>
                    <button onClick={() => setShowVisibility(false)}><X size={14} className="text-zinc-500 hover:text-white" /></button>
                 </div>
                 <div className="space-y-1.5">
                    {table.getAllLeafColumns().map(column => {
                      if (column.id === 'actions') return null;
                      return (
                        <label key={column.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors group">
                           <input
                             type="checkbox"
                             checked={column.getIsVisible()}
                             onChange={column.getToggleVisibilityHandler()}
                             className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-500 focus:ring-offset-zinc-900 focus:ring-blue-500"
                           />
                           <span className="text-xs text-zinc-400 group-hover:text-zinc-200 capitalize">{column.id.replace('_', ' ')}</span>
                        </label>
                      );
                    })}
                 </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => {
                setShowFilters(!showFilters);
                setShowVisibility(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-[320px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Filtros Avançados</span>
                    <button onClick={() => setShowFilters(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Família</label>
                       <select 
                         className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                         value={filters.familia || ''}
                         onChange={(e) => setFilters({ ...filters, familia: e.target.value || undefined })}
                       >
                         <option value="">Todas as famílias</option>
                         {familaOptions.map(f => <option key={f} value={f}>{f}</option>)}
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Status</label>
                       <select 
                         className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                         value={filters.status || ''}
                         onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                       >
                         <option value="">Qualquer status</option>
                         <option value="Ativo">Ativo</option>
                         <option value="Excluido">Excluído</option>
                       </select>
                    </div>
                 </div>

                 <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-zinc-800/50">
                    <button 
                      onClick={() => {
                        setFilters({});
                        setSearchTerm('');
                        setShowFilters(false);
                      }}
                      className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Limpar Filtros
                    </button>
                 </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button 
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>


      {/* Table Container */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/50">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-zinc-800/50 transition-colors' : ''} ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={`flex items-center gap-2 ${header.column.columnDef.meta?.align === 'right' ? 'justify-end' : header.column.columnDef.meta?.align === 'center' ? 'justify-center' : ''}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="text-zinc-600 transition-colors">
                            {{
                              asc: <ArrowUp className="w-3 h-3 text-blue-400" />,
                              desc: <ArrowDown className="w-3 h-3 text-blue-400" />,
                            }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isLoading && !data ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-6 py-5">
                        <div className="h-4 bg-zinc-800/50 rounded-md w-full"></div>
                      </td>
                    ))}
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
                  <td colSpan={columns.length} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                       <Package size={40} className="text-zinc-700" />
                       <p className="text-sm font-medium text-zinc-500">Nenhum produto encontrado na base.</p>
                       <button onClick={() => {setSearchTerm(''); setFilters({});}} className="text-xs text-blue-400 font-bold hover:underline">Limpar filtros e pesquisa</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            Mostrando <span className="text-white font-bold">{table.getRowModel().rows.length}</span> de <span className="text-white font-bold">{data?.totalRegistros || 0}</span> produtos
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
        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-2">
          <X className="w-5 h-5" />
          <p className="text-sm font-medium">Erro ao carregar matriz de produtos: {(error as Error).message}</p>
        </div>
      )}
    </div>
  );
}
