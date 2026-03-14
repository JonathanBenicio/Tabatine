'use client';

import React, { useEffect } from 'react';
import { useVendasStore } from '@/store/useVendasStore';
import { Search, TrendingUp, AlertCircle, RefreshCw, Eye, Package, User, Wallet, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Pagination from './Pagination';

export default function VendasTable() {
  const { vendas, loading, error, currentPage, totalPaginas, totalRegistros, fetchVendas } = useVendasStore();

  useEffect(() => {
    fetchVendas(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const headers = [
    "📅 DATA", "👥 CLIENTE", "👤 VENDEDOR", "📦 PEDIDO", "📄 NF",
    "🛒 PRODUTO", "📦 UND", "💰 VALOR VENDA", "💳 COND. PAGTO.",
    "🚚 FRETE", "📈 COMS. %", "🎯 VALOR TOTAL", "🏦 FORMA PG",
    "🏛️ BANCO", "💰 Parcela 1", "📅 Venc. 1", "🚦 Status Venc.",
    "💰 Parcela 2", "📅 Venc. 2", "💰 Parcela 3", "📅 Venc. 3", "🎗️ Status Comissão"
  ];

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
              placeholder="Pesquisar vendas..." 
              className="pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-orange-500/40 rounded-xl text-sm placeholder:text-zinc-600 outline-none w-full lg:w-72 transition-all focus:ring-4 focus:ring-orange-500/5 backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={() => fetchVendas(1)} 
            disabled={loading}
            className="p-2.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
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
            <p className="text-3xl font-bold text-white tracking-tighter">{totalRegistros}</p>
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
            <p className="opacity-70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Massive Table Container */}
      <div className="group relative rounded-3xl border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/20">
                {headers.map((h, i) => (
                    <th key={i} className="py-5 px-5 text-[9px] font-black text-zinc-500 uppercase tracking-widest font-sans whitespace-nowrap">
                        {h}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {loading && vendas.length === 0 ? (
                /* Skeleton rows */
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     {headers.map((_, col) => (
                        <td key={col} className="py-5 px-5">
                          <div className="h-4 bg-zinc-800/50 rounded-md w-full min-w-[70px]"></div>
                        </td>
                     ))}
                  </tr>
                ))
              ) : vendas.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-24 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 group/icon">
                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover/icon:text-zinc-500 transition-colors">
                        <Package size={32} />
                      </div>
                      <p className="text-zinc-400 font-medium">Nenhuma venda localizada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vendas.map((v, idx) => (
                  <tr 
                    key={v.id_linha || idx} 
                    className="group/row hover:bg-orange-500/[0.03] transition-all duration-300"
                  >
                    <td className="py-4 px-5 whitespace-nowrap text-xs font-mono text-zinc-400">{formatDate(v.data)}</td>
                    <td className="py-4 px-5 min-w-[220px]">
                      <div className="flex items-center gap-2 group-hover/row:translate-x-1 transition-transform">
                        <User size={12} className="text-zinc-600" />
                        <span className="text-xs font-bold text-white group-hover/row:text-orange-400 transition-colors">{v.cliente}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 min-w-[150px] text-[11px] text-zinc-400 font-medium">{v.vendedor}</td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="text-[11px] font-black text-orange-500/80 bg-orange-500/5 px-2 py-0.5 rounded-lg border border-orange-500/10">#{v.pedido}</span>
                    </td>
                    <td className="py-4 px-5 text-[11px] text-zinc-500 font-mono">{v.nf || '---'}</td>
                    
                    <td className="py-4 px-5 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-zinc-600" />
                        <span className="text-xs font-medium text-zinc-300 truncate max-w-[180px]">{v.produto}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[11px] font-bold text-zinc-500 uppercase">{v.und}</td>
                    <td className="py-4 px-5 text-xs font-bold text-emerald-400">{formatCurrency(v.valorVenda)}</td>
                    
                    <td className="py-4 px-5 text-[11px] text-zinc-400 font-medium italic">{v.condPagto}</td>
                    <td className="py-4 px-5 text-[11px] text-zinc-500">{formatCurrency(v.frete)}</td>
                    <td className="py-4 px-5">
                      <span className="text-[11px] font-bold text-indigo-400">{v.percComissao}%</span>
                    </td>
                    <td className="py-4 px-5 text-xs font-black text-white">{formatCurrency(v.valorTotal)}</td>
                    <td className="py-4 px-5 text-[11px] text-zinc-400 uppercase tracking-tighter">{v.formaPg}</td>
                    <td className="py-4 px-5 text-[10px] text-zinc-500 font-medium">{v.banco}</td>

                    <td className="py-4 px-5 text-[11px] font-bold text-amber-500/80">{v.parcela1 ? formatCurrency(v.parcela1.valor) : '---'}</td>
                    <td className="py-4 px-5 text-[10px] font-mono text-zinc-500">{v.parcela1 ? formatDate(v.parcela1.vencimento) : '---'}</td>
                    <td className="py-4 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-black text-zinc-400 uppercase tracking-tighter border border-zinc-700">
                          {v.vencimentoStatus}
                        </span>
                    </td>

                    <td className="py-4 px-5 text-[11px] font-bold text-amber-500/80">{v.parcela2 ? formatCurrency(v.parcela2.valor) : '---'}</td>
                    <td className="py-4 px-5 text-[10px] font-mono text-zinc-500">{v.parcela2 ? formatDate(v.parcela2.vencimento) : '---'}</td>

                    <td className="py-4 px-5 text-[11px] font-bold text-amber-500/80">{v.parcela3 ? formatCurrency(v.parcela3.valor) : '---'}</td>
                    <td className="py-4 px-5 text-[10px] font-mono text-zinc-500">{v.parcela3 ? formatDate(v.parcela3.vencimento) : '---'}</td>

                    <td className="py-4 px-5">
                        <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase border border-orange-500/20">
                            {v.statusComissao}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPaginas={totalPaginas}
          onPageChange={fetchVendas}
          loading={loading}
        />

        {/* Loading Overlay */}
        {loading && vendas.length > 0 && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center z-20">
            <RefreshCw className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em] mt-4">Calculando Matriz...</p>
          </div>
        )}
      </div>
    </div>
  );
}
