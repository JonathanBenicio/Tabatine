'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useVendasStore } from '@/store/useVendasStore';
import { useLookupStore } from '@/store/useLookupStore';
import { 
  Search,
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Package, 
  Filter,
  FileDown,
  Settings2,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import Pagination from './Pagination';
import { useSuspenseVendasQuery } from '@/hooks/useVendasQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { exportToCSV } from '@/utils/export-utils';
import { TableContainer } from './ui/TableContainer';
import { TableSearch } from './ui/TableSearch';
import { TableSummaryCard } from './ui/TableSummaryCard';
import { getVendasColumns } from './vendas-columns';

export default function VendasTable() {
  const router = useRouter();
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage,
    sorting, setSorting, columnVisibility, setColumnVisibility,
    filters, setFilters, pageSize, setPageSize,
    columnFilters, setColumnFilters, columnPinning, setColumnPinning,
    showColumnFilters, setShowColumnFilters
  } = useVendasStore();

  const { getClienteNome, getVendedorNome, getContaNome } = useLookupStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data, error, refetch } = useSuspenseVendasQuery(
    currentPage, 
    pageSize,
    searchTerm, 
    sorting, 
    columnFilters,
    filters
  );

  const columns = useMemo(() => getVendasColumns(
    getClienteNome,
    getVendedorNome,
    getContaNome,
    (id) => startTransition(() => router.push(`/vendas/${id}`))
  ), [getClienteNome, getVendedorNome, getContaNome, router]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data.vendas,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnPinning,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      startTransition(() => {
        setSorting(newSorting);
      });
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      startTransition(() => {
        setColumnFilters(newFilters);
      });
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
    },
    onColumnPinningChange: (updater) => {
      const newPinning = typeof updater === 'function' ? updater(columnPinning) : updater;
      setColumnPinning(newPinning);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    columnResizeMode: 'onChange',
  });

  const handleExport = () => {
    if (data?.vendas) {
      const exportData = data.vendas.map(v => ({
        Data: v.data,
        Pedido: v.numeroPedido,
        Cliente: getClienteNome(v.cliente),
        Vendedor: getVendedorNome(v.vendedor),
        Produto: v.produto,
        ValorTotal: v.valorTotal,
        Etapa: v.etapa,
        NF: v.nf
      }));
      exportToCSV(exportData, 'vendas_tabatine');
    }
  };

  const setDatePreset = (preset: 'today' | 'this_month' | 'this_year' | 'last_7') => {
    const now = new Date();
    let start: Date, end: Date;

    switch (preset) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'this_year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'last_7':
        start = subDays(now, 7);
        end = now;
        break;
      default:
        return;
    }

    startTransition(() => {
      setFilters({
        ...filters,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd')
      });
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 dark:text-orange-400">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Análise de Vendas
            </h2>
          </div>
          <p className="text-slate-500 dark:text-zinc-500 text-sm max-w-md">Relatório detalhado de pedidos, produtos e parcelamentos.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TableSearch 
            value={searchTerm}
            onChange={(val) => startTransition(() => setSearchTerm(val))}
            placeholder="Pesquisar pedido ou cliente..."
            className="flex-1 lg:flex-none lg:w-64"
            isLoading={isPending}
          />

          <div className="relative">
            <button 
              onClick={() => {
                setShowVisibility(!showVisibility);
                setShowFilters(false);
              }}
              className={`p-2.5 rounded-xl border transition-all ${showVisibility ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 dark:text-orange-400' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 backdrop-blur-sm'}`}
              title="Colunas"
            >
              <Settings2 size={18} />
            </button>
            
            {showVisibility && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">Visibilidade</div>
                <div className="space-y-1">
                  {table.getAllLeafColumns().map(column => {
                    if (column.id === 'actions') return null;
                    return (
                      <label key={column.id} className="flex items-center gap-3 px-2 py-2 hover:bg-zinc-800/50 rounded-lg cursor-pointer group transition-colors">
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-orange-500/20"
                        />
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-200">{column.id}</span>
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
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' : 'bg-white/50 dark:bg-zinc-900/40 border-white/60 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white backdrop-blur-sm shadow-sm'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {showFilters && (
               <div className="absolute right-0 mt-2 w-[340px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Filtros Avançados</span>
                  <button onClick={() => setShowFilters(false)} className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={16} /></button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/50 mb-6 group/switch">
                  <div className="flex items-center gap-2">
                    <Settings2 size={14} className="text-slate-400 dark:text-zinc-500 group-hover/switch:text-orange-500 transition-colors" />
                    <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Filtros por Coluna</span>
                  </div>
                  <button 
                    onClick={() => setShowColumnFilters(!showColumnFilters)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-all ${showColumnFilters ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-300 dark:bg-zinc-800'}`}
                  >
                    <span className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg transition-transform ${showColumnFilters ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                  </button>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Atalhos de Data</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setDatePreset('today')} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] text-slate-600 dark:text-zinc-400 hover:text-orange-500 transition-all">Hoje</button>
                      <button onClick={() => setDatePreset('last_7')} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] text-slate-600 dark:text-zinc-400 hover:text-orange-500 transition-all">Últimos 7 dias</button>
                      <button onClick={() => setDatePreset('this_month')} className="px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] text-slate-600 dark:text-zinc-400 hover:text-orange-500 transition-all">Este Mês</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Período Customizado</label>
                    <div className="flex gap-2">
                      <input 
                        type="date" 
                        className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 w-full outline-none focus:border-orange-500/50"
                        value={filters.startDate || ''}
                        onChange={(e) => startTransition(() => setFilters({...filters, startDate: e.target.value}))}
                      />
                      <input 
                        type="date" 
                        className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-slate-700 dark:text-zinc-300 w-full outline-none focus:border-orange-500/50"
                        value={filters.endDate || ''}
                        onChange={(e) => startTransition(() => setFilters({...filters, endDate: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800/50">
                  <button onClick={() => { startTransition(() => setFilters({})); setShowFilters(false); }} className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest hover:text-orange-500 transition-colors">Limpar</button>
                  <button onClick={() => setShowFilters(false)} className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg shadow-orange-500/20">Aplicar</button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all backdrop-blur-sm shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button  
            onClick={() => startTransition(() => { refetch(); })} 
            disabled={isPending}
            className="p-2.5 bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 hover:border-orange-500/50 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-orange-500 transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin text-orange-500' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TableSummaryCard 
          label="Pedidos Encontrados"
          value={data?.totalRegistros || 0}
          sublabel="Fluxo Analítico"
          icon={Package}
          variant="orange"
          isLoading={isPending}
        />

        <TableSummaryCard 
          label="Volume (Pág. Atual)"
          value={data?.vendas?.reduce((sum, v) => sum + (v.valorTotal || 0), 0) || 0}
          sublabel="Soma dos itens listados"
          icon={TrendingUp}
          variant="emerald"
          isCurrency={true}
          isLoading={isPending}
        />

        <TableSummaryCard 
          label="Ticket Médio (Item)"
          value={data?.vendas?.length 
            ? (data.vendas.reduce((sum, v) => sum + (v.valorTotal || 0), 0) / data.vendas.length)
            : 0}
          sublabel="Média por linha"
          icon={Package}
          variant="blue"
          isCurrency={true}
          isLoading={isPending}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Erro no relatório de vendas</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer
        isLoading={isPending}
        isEmpty={table.getRowModel().rows.length === 0}
        emptyMessage="Nenhuma venda localizada"
        emptyIcon={Package}
        pagination={
          <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-6">
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest">
                  Mostrando <span className="text-slate-900 dark:text-white">{table.getRowModel().rows.length}</span> de <span className="text-slate-900 dark:text-white">{data?.totalRegistros || 0}</span> pedidos
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-zinc-600 font-bold uppercase tracking-widest">Linhas:</span>
                  <select 
                    value={pageSize}
                    onChange={e => startTransition(() => setPageSize(Number(e.target.value)))}
                    className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400 outline-none focus:border-orange-500/50 transition-all focus:bg-white dark:focus:bg-zinc-900"
                  >
                    {[10, 20, 50, 100].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
             </div>
            <Pagination 
              currentPage={currentPage}
              totalPaginas={data?.totalPaginas || 1}
              onPageChange={(page) => startTransition(() => setCurrentPage(page))}
              loading={isPending}
            />
          </div>
        }
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-max min-w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/20">
                  {headerGroup.headers.map(header => {
                    const isPinned = header.column.getIsPinned();
                    
                    const pinningStyles: React.CSSProperties = isPinned ? {
                      position: 'sticky',
                      left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                      right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined, 
                      zIndex: 30,
                      backgroundColor: 'rgb(var(--card))', 
                    } : {
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                    };

                    return (
                      <th 
                        key={header.id} 
                        colSpan={header.colSpan}
                        className={`py-4 px-5 text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-sans whitespace-nowrap select-none transition-colors 
                          ${header.column.getCanSort() ? 'cursor-pointer hover:bg-orange-500/5 hover:text-orange-500 dark:hover:text-orange-400' : ''} 
                          ${isPinned ? 'shadow-[2px_0_10px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_10px_rgba(0,0,0,0.5)] z-40' : ''}`}
                        style={{ 
                          width: header.getSize() !== 150 ? header.getSize() : undefined,
                          ...pinningStyles
                        }}
                      >
                        <div className="flex flex-col gap-2">
                          <div 
                            className="flex items-center gap-2" 
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-3 h-3 text-orange-500" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-3 h-3 text-orange-500" />
                            ) : header.column.getCanSort() ? (
                              <ChevronsUpDown className="w-3 h-3 text-slate-400 group-hover/header:text-orange-500 opacity-30 group-hover/header:opacity-100 transition-all" />
                            ) : null}
                          </div>
                          
                          {header.column.getCanFilter() && showColumnFilters && (
                            <div className="relative group/filter mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within/filter:text-orange-500 transition-colors" />
                              <input
                                type="text"
                                value={(header.column.getFilterValue() ?? '') as string}
                                onChange={e => startTransition(() => header.column.setFilterValue(e.target.value))}
                                placeholder="Filtrar..."
                                onClick={e => e.stopPropagation()}
                                className="w-full bg-slate-200/50 dark:bg-zinc-950/50 border border-slate-300 dark:border-zinc-800 rounded-md py-1.5 pl-7 pr-2 text-[9px] font-medium text-slate-700 dark:text-zinc-400 placeholder:text-slate-400 dark:placeholder:text-zinc-700 outline-none focus:border-orange-500/30 transition-all focus:bg-white dark:focus:bg-zinc-900"
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/30">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="group/row hover:bg-orange-500/[0.03] transition-all duration-300"
                >
                  {row.getVisibleCells().map(cell => {
                    const isPinned = cell.column.getIsPinned();
                    const pinningStyles: React.CSSProperties = isPinned ? {
                      position: 'sticky',
                      left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                      right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                      zIndex: 10,
                      backgroundColor: 'rgb(var(--card))', 
                      backdropFilter: 'blur(8px)',
                    } : {};

                    return (
                      <td 
                        key={cell.id} 
                        className={`py-4 px-5 whitespace-nowrap border-b border-slate-200 dark:border-zinc-800/10 ${isPinned ? 'shadow-[2px_0_5px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.3)]' : ''}`}
                        style={pinningStyles}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableContainer>
    </div>
  );
}
