'use client';

import React, { useMemo, useState } from 'react';
import { useVendasStore, VendaPlana } from '@/store/useVendasStore';
import { useLookupStore } from '@/store/useLookupStore';
import { Search, TrendingUp, AlertCircle, RefreshCw, Eye, Package, User, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import Pagination from './Pagination';
import { useVendasQuery } from '@/hooks/useVendasQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<VendaPlana>();

export default function VendasTable() {
  const router = useRouter();
  const { 
    currentPage, totalPaginas, totalRegistros, 
    anoSelecionado, setAnoSelecionado, searchTerm, setSearchTerm 
  } = useVendasStore();
  const { getClienteNome, getVendedorNome, getContaNome } = useLookupStore();

  const { data, isLoading, error, refetch } = useVendasQuery(currentPage, anoSelecionado, searchTerm);

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
    '10': { label: 'Pedido', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    '20': { label: 'Separar', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    '30': { label: 'Faturar', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    '50': { label: 'Faturado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    '60': { label: 'Entregue', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    '70': { label: 'Cancelado', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    '80': { label: 'Devolvido', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
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
    columnHelper.accessor('parcela1', {
      header: '💰 Parcela 1',
      cell: info => <span className="text-[11px] font-bold text-amber-500/80">{info.getValue() ? formatCurrency(info.getValue()!.valor) : '---'}</span>,
    }),
    columnHelper.accessor('parcela1.vencimento', {
        id: 'venc1',
        header: '📅 Venc. 1',
        cell: info => <span className="text-[10px] font-mono text-zinc-500">{info.row.original.parcela1 ? formatDate(info.row.original.parcela1.vencimento) : '---'}</span>,
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
    columnHelper.accessor('parcela2', {
      header: '💰 Parcela 2',
      cell: info => <span className="text-[11px] font-bold text-amber-500/80">{info.getValue() ? formatCurrency(info.getValue()!.valor) : '---'}</span>,
    }),
    columnHelper.accessor('parcela2.vencimento', {
        id: 'venc2',
        header: '📅 Venc. 2',
        cell: info => <span className="text-[10px] font-mono text-zinc-500">{info.row.original.parcela2 ? formatDate(info.row.original.parcela2.vencimento) : '---'}</span>,
    }),
    columnHelper.accessor('parcela3', {
      header: '💰 Parcela 3',
      cell: info => <span className="text-[11px] font-bold text-amber-500/80">{info.getValue() ? formatCurrency(info.getValue()!.valor) : '---'}</span>,
    }),
    columnHelper.accessor('parcela3.vencimento', {
        id: 'venc3',
        header: '📅 Venc. 3',
        cell: info => <span className="text-[10px] font-mono text-zinc-500">{info.row.original.parcela3 ? formatDate(info.row.original.parcela3.vencimento) : '---'}</span>,
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
    getCoreRowModel: getCoreRowModel(),
  });

  const yearOptions = [2023, 2024, 2025, 2026, 2027];

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
              placeholder="Número do pedido ou cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-orange-500/40 rounded-xl text-sm placeholder:text-zinc-600 outline-none w-full lg:w-72 transition-all focus:ring-4 focus:ring-orange-500/5 backdrop-blur-sm"
            />
          </div>

          <div className="relative group">
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              disabled={isLoading}
              className="appearance-none pl-4 pr-10 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-orange-500/40 rounded-xl text-sm text-zinc-300 outline-none w-32 transition-all cursor-pointer backdrop-blur-sm"
            >
              <option value="all">Todos os Anos</option>
              {yearOptions.reverse().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-orange-400 transition-colors" />
          </div>

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
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
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

      {/* Massive Table Container */}
      <div className="group relative rounded-3xl border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/20">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="py-5 px-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest font-sans whitespace-nowrap"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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

        <Pagination 
          currentPage={currentPage}
          totalPaginas={data?.totalPaginas || 1}
          onPageChange={(page) => useVendasStore.getState().setCurrentPage(page)}
          loading={isLoading}
        />

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
