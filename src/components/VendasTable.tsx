'use client';

import React, { useMemo, useState } from 'react';
import { useVendasStore, VendaPlana } from '@/store/useVendasStore';
import { useLookupStore } from '@/store/useLookupStore';
import { 
  Search, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Package, 
  User, 
  Calendar,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  Settings2,
  X,
  ChevronDown
} from 'lucide-react';
import { format, parseISO, startOfYear, endOfYear, startOfMonth, endOfMonth, subDays, startOfDay, endOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import Pagination from './Pagination';
import { useVendasQuery } from '@/hooks/useVendasQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { exportToCSV } from '@/utils/export-utils';

const columnHelper = createColumnHelper<VendaPlana>();

export default function VendasTable() {
  const router = useRouter();
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage,
    sorting, setSorting, columnVisibility, setColumnVisibility,
    filters, setFilters
  } = useVendasStore();

  const { getClienteNome, getVendedorNome, getContaNome, clientes, vendedores, contas } = useLookupStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);

  const { data, isLoading, error, refetch } = useVendasQuery(
    currentPage, 
    searchTerm, 
    sorting, 
    filters
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '--') return '--';
    try {
      if (dateStr.includes('/')) return dateStr; 
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const etapaMap: Record<string, { label: string; color: string }> = {
    '10': { label: 'Pedido', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' },
    '20': { label: 'Separar', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' },
    '30': { label: 'Faturar', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' },
    '50': { label: 'Faturado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' },
    '60': { label: 'Entregue', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]' },
    '70': { label: 'Cancelado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' },
    '80': { label: 'Devolvido', color: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' },
  };

  const formatEtapa = (etapa: string) => {
    const mapped = etapaMap[etapa];
    if (mapped) return mapped;
    return { label: etapa || 'Pendente', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' };
  };

  const columns = useMemo(() => [
    columnHelper.accessor('data', {
      header: '📅 DATA',
      cell: info => <span className="text-xs font-mono text-zinc-400">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor('cliente', {
      header: '👥 CLIENTE',
      cell: info => (
        <div className="flex items-center gap-2 group-hover/row:translate-x-1 transition-transform">
          <User size={12} className="text-zinc-600" />
          <span className="text-xs font-bold text-white group-hover/row:text-orange-400 transition-colors">
            {getClienteNome(info.getValue())}
          </span>
        </div>
      ),
      minSize: 220,
    }),
    columnHelper.accessor('vendedor', {
      header: '👤 VENDEDOR',
      cell: info => <span className="text-[11px] text-zinc-400 font-medium">{getVendedorNome(info.getValue())}</span>,
      minSize: 150,
    }),
    columnHelper.accessor('pedido', {
      header: '📦 PEDIDO',
      cell: info => <span className="text-[11px] font-black text-orange-500/80 bg-orange-500/5 px-2 py-0.5 rounded-lg border border-orange-500/10">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('nf', {
      header: '📄 NF',
      cell: info => <span className="text-[11px] text-zinc-500 font-mono">{info.getValue() || '---'}</span>,
    }),
    columnHelper.accessor('produto', {
      header: '🛒 PRODUTO',
      cell: info => (
        <div className="flex items-center gap-2">
          <Package size={12} className="text-zinc-600" />
          <span className="text-xs font-medium text-zinc-300 truncate max-w-[180px]">{info.getValue()}</span>
        </div>
      ),
      minSize: 200,
    }),
    columnHelper.accessor('und', {
      header: '📦 UND',
      cell: info => <span className="text-[11px] font-bold text-zinc-500 uppercase">{info.getValue()}</span>,
    }),
    columnHelper.accessor('valorVenda', {
      header: '💰 VALOR VENDA',
      cell: info => <span className="text-xs font-bold text-emerald-400">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('condPagto', {
      header: '💳 COND. PAGTO.',
      cell: info => <span className="text-[11px] text-zinc-400 font-medium italic">{info.getValue()}</span>,
    }),
    columnHelper.accessor('frete', {
      header: '🚚 FRETE',
      cell: info => <span className="text-[11px] text-zinc-500">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('percComissao', {
      header: '📈 COMS. %',
      cell: info => <span className="text-[11px] font-bold text-indigo-400">{info.getValue()}%</span>,
    }),
    columnHelper.accessor('valorTotal', {
      header: '🎯 VALOR TOTAL',
      cell: info => <span className="text-xs font-black text-white">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('formaPg', {
      header: '🏦 FORMA PG',
      cell: info => <span className="text-[11px] text-zinc-400 uppercase tracking-tighter">{info.getValue()}</span>,
    }),
    columnHelper.accessor('banco', {
      header: '🏛️ BANCO',
      cell: info => <span className="text-[10px] text-zinc-500 font-medium">{getContaNome(info.getValue())}</span>,
    }),
    columnHelper.accessor('parcela1.valor', {
      id: 'parcela1',
      header: '💰 Parcela 1',
      cell: info => <span className="text-[11px] font-bold text-amber-500/80">{info.getValue() ? formatCurrency(info.getValue() as number) : '---'}</span>,
    }),
    columnHelper.accessor('parcela1.vencimento', {
        id: 'venc1',
        header: '📅 Venc. 1',
        cell: info => <span className="text-[10px] font-mono text-zinc-500">{info.getValue() ? formatDate(info.getValue() as string) : '---'}</span>,
    }),
    columnHelper.accessor('vencimentoStatus', {
      header: '🚦 Status Venc.',
      cell: info => {
        const status = formatEtapa(info.getValue());
        return (
          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${status.color}`}>
            {status.label}
          </span>
        );
      },
    }),
    columnHelper.accessor('parcela2.valor', {
      id: 'parcela2',
      header: '💰 Parcela 2',
      cell: info => <span className="text-[11px] font-bold text-amber-500/80">{info.getValue() ? formatCurrency(info.getValue() as number) : '---'}</span>,
    }),
    columnHelper.accessor('parcela2.vencimento', {
        id: 'venc2',
        header: '📅 Venc. 2',
        cell: info => <span className="text-[10px] font-mono text-zinc-500">{info.getValue() ? formatDate(info.getValue() as string) : '---'}</span>,
    }),
    columnHelper.accessor('parcela3.valor', {
      id: 'parcela3',
      header: '💰 Parcela 3',
      cell: info => <span className="text-[11px] font-bold text-amber-500/80">{info.getValue() ? formatCurrency(info.getValue() as number) : '---'}</span>,
    }),
    columnHelper.accessor('parcela3.vencimento', {
        id: 'venc3',
        header: '📅 Venc. 3',
        cell: info => <span className="text-[10px] font-mono text-zinc-500">{info.getValue() ? formatDate(info.getValue() as string) : '---'}</span>,
    }),
    columnHelper.accessor('statusComissao', {
      header: '🎗️ Status Comissão',
      cell: info => (
        <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase border border-orange-500/20">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '⚡ AÇÕES',
      cell: info => (
        <button 
          onClick={() => router.push(`/vendas/${info.row.original.id_linha}`)}
          className="p-2 rounded-lg bg-zinc-800/50 hover:bg-orange-500/20 text-zinc-400 hover:text-orange-400 transition-colors border border-zinc-700/50 hover:border-orange-500/30 group"
          title="Ver Detalhes"
        >
          <Eye size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      ),
      meta: { align: 'right' }
    }),
  ], [getClienteNome, getVendedorNome, getContaNome, router]);

  const table = useReactTable({
    data: data?.vendas || [],
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

    setFilters({
      ...filters,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Análise de Vendas
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-md">Relatório detalhado de pedidos, produtos e parcelamentos.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar pedido ou cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-orange-500/40 rounded-xl text-sm placeholder:text-zinc-600 outline-none w-full lg:w-64 transition-all focus:ring-4 focus:ring-orange-500/5 backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowVisibility(!showVisibility)}
              className={`p-2.5 rounded-xl border transition-all ${showVisibility ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 backdrop-blur-sm'}`}
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
                 <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {table.getAllLeafColumns().map(column => {
                      if (column.id === 'actions') return null;
                      return (
                        <label key={column.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors group">
                           <input
                             type="checkbox"
                             checked={column.getIsVisible()}
                             onChange={column.getToggleVisibilityHandler()}
                             className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-offset-zinc-900 focus:ring-orange-500"
                           />
                           <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 capitalize">{column.id.replace(/[._]/g, ' ')}</span>
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
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 backdrop-blur-sm'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-[340px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                 <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Filtros Avançados</span>
                    <button onClick={() => setShowFilters(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
                 </div>

                 <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Data (Presets)</label>
                       <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setDatePreset('today')} className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all">Hoje</button>
                          <button onClick={() => setDatePreset('last_7')} className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all">Últimos 7 dias</button>
                          <button onClick={() => setDatePreset('this_month')} className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all">Este Mês</button>
                          <button onClick={() => setDatePreset('this_year')} className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all">Este Ano</button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Período Customizado</label>
                       <div className="flex gap-2">
                          <input 
                            type="date" 
                            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-zinc-300 w-full outline-none focus:border-orange-500/50"
                            value={filters.startDate || ''}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                          />
                          <input 
                            type="date" 
                            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-zinc-300 w-full outline-none focus:border-orange-500/50"
                            value={filters.endDate || ''}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Filtrar por ID</label>
                       <div className="space-y-2">
                          <input 
                            type="number" 
                            placeholder="ID do Cliente (Omie)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-orange-500/50"
                            value={filters.clienteOmieId || ''}
                            onChange={(e) => setFilters({...filters, clienteOmieId: e.target.value ? Number(e.target.value) : undefined})}
                          />
                          <input 
                            type="number" 
                            placeholder="ID do Vendedor (Omie)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-orange-500/50"
                            value={filters.vendedorOmieId || ''}
                            onChange={(e) => setFilters({...filters, vendedorOmieId: e.target.value ? Number(e.target.value) : undefined})}
                          />
                          <input 
                            type="number" 
                            placeholder="ID do Banco (Omie)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-orange-500/50"
                            value={filters.contaCorrenteId || ''}
                            onChange={(e) => setFilters({...filters, contaCorrenteId: e.target.value ? Number(e.target.value) : undefined})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800/50">
                    <button 
                      onClick={() => {
                        setFilters({});
                        setShowFilters(false);
                      }}
                      className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Limpar Tudo
                    </button>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
                    >
                      Aplicar
                    </button>
                 </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-sm"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button  
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-2.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-orange-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pedidos Encontrados</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Package size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tighter">{data?.totalRegistros || 0}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Fluxo Analítico</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Volume (Pág. Atual)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">
              {formatCurrency(data?.vendas?.reduce((sum, v) => sum + (v.valorTotal || 0), 0) || 0)}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Soma dos itens listados</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ticket Médio (Item)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
               <Package size={14} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(
                data?.vendas?.length 
                  ? (data.vendas.reduce((sum, v) => sum + (v.valorTotal || 0), 0) / data.vendas.length)
                  : 0
              )}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Média por linha</p>
          </div>
        </div>
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
      <div className="group relative rounded-3xl border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/20">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`py-5 px-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest font-sans whitespace-nowrap select-none ${header.column.getCanSort() ? 'cursor-pointer hover:bg-orange-500/5 hover:text-orange-400 transition-colors' : ''}`}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="text-orange-500/50 transition-colors">
                            {{
                              asc: <ArrowUp className="w-3 h-3 text-orange-400" />,
                              desc: <ArrowDown className="w-3 h-3 text-orange-400" />,
                            }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {isLoading && !data ? (
                /* Skeleton rows */
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     {columns.map((_, col) => (
                        <td key={col} className="py-5 px-5">
                          <div className="h-4 bg-zinc-800/50 rounded-md w-full min-w-[70px]"></div>
                        </td>
                     ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 group/icon">
                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover/icon:text-zinc-500 transition-colors">
                        <Package size={32} />
                      </div>
                      <p className="text-zinc-400 font-medium">Nenhuma venda localizada</p>
                      <button onClick={() => {setSearchTerm(''); setFilters({});}} className="text-xs text-orange-400 font-bold hover:underline">Limpar filtros e pesquisa</button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="group/row hover:bg-orange-500/[0.03] transition-all duration-300"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-4 px-5 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800/50 bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Mostrando <span className="text-white">{table.getRowModel().rows.length}</span> de <span className="text-white">{data?.totalRegistros || 0}</span> pedidos
          </p>
          <Pagination 
            currentPage={currentPage}
            totalPaginas={data?.totalPaginas || 1}
            onPageChange={setCurrentPage}
            loading={isLoading}
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && data && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center z-20">
            <RefreshCw className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em] mt-4">Calculando Matriz...</p>
          </div>
        )}
      </div>
    </div>
  );
}
