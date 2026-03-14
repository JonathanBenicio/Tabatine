'use client';

import React, { useEffect } from 'react';
import { useVendasStore } from '@/store/useVendasStore';
import { Search, ChevronLeft, ChevronRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function VendasTable() {
  const { vendas, loading, error, currentPage, totalPaginas, totalRegistros, fetchVendas } = useVendasStore();

  useEffect(() => {
    fetchVendas(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextPage = () => {
    if (currentPage < totalPaginas) fetchVendas(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchVendas(currentPage - 1);
  };

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

  // Fixed specific header order requested by the user
  const headers = [
    "DATA", "CLIENTES", "VENDEDOR", "PEDIDO", "NF",
    "PRODUTO", "UND", "VALOR DE VENDA", "COND. PAGTO.",
    "FRETE", "% COMS. VENDA", "VALOR TOTAL", "FORMA DE PG",
    "BANCO", "R$ Parcela", "Vencimento", "Vencimento/Status",
    "R$ Parcela 2", "Vencimento 2", "R$ Parcela 3", "Vencimento 3", "Status Comissão"
  ];

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">
            Relatório Analítico de Vendas
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Visão detalhada de produtos, comissões e parcelamentos.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar pedido ou cliente..." 
              className="pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 focus:border-orange-500/50 rounded-xl text-sm placeholder:text-zinc-500 outline-none w-64 transition-all focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
          <button 
            onClick={() => fetchVendas(1)} 
            className="p-2.5 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-400 items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Erro ao consultar matriz de vendas</p>
            <p className="opacity-80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Info Card Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium pb-1 uppercase tracking-wider">Total de Pedidos Retornados</p>
            <p className="text-2xl font-semibold">{totalRegistros}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container with massive horizontal scroll */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/50">
                {headers.map((h, i) => (
                    <th key={i} className="py-4 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono whitespace-nowrap">
                        {h}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading && vendas.length === 0 ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     {headers.map((_, col) => (
                         <td key={col} className="py-4 px-4">
                             <div className="h-4 bg-zinc-800 rounded w-full min-w-[60px]"></div>
                         </td>
                     ))}
                  </tr>
                ))
              ) : vendas.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-12 px-6 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <TrendingUp className="w-10 h-10 opacity-20" />
                      <p>Nenhuma venda localizada para essa página.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vendas.map((v) => (
                  <tr 
                    key={v.id_linha} 
                    className="hover:bg-zinc-800/20 transition-colors group cursor-pointer text-xs"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-300">{formatDate(v.data)}</td>
                    <td className="py-3 px-4 min-w-[200px] text-white font-medium">{v.cliente}</td>
                    <td className="py-3 px-4 min-w-[150px] text-zinc-300">{v.vendedor}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-orange-400">#{v.pedido}</td>
                    <td className="py-3 px-4 text-zinc-400">{v.nf || '--'}</td>
                    
                    {/* Produto Info */}
                    <td className="py-3 px-4 min-w-[200px] text-white">{v.produto}</td>
                    <td className="py-3 px-4 text-zinc-400">{v.und}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{formatCurrency(v.valorVenda)}</td>
                    
                    {/* Metadados */}
                    <td className="py-3 px-4 text-zinc-300">{v.condPagto}</td>
                    <td className="py-3 px-4 text-zinc-400">{formatCurrency(v.frete)}</td>
                    <td className="py-3 px-4 text-indigo-400 font-bold">{v.percComissao}%</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{formatCurrency(v.valorTotal)}</td>
                    <td className="py-3 px-4 text-zinc-300">{v.formaPg}</td>
                    <td className="py-3 px-4 text-zinc-300">{v.banco}</td>

                    {/* Parcelas Horizontais */}
                    <td className="py-3 px-4 text-amber-200">{v.parcela1 ? formatCurrency(v.parcela1.valor) : '--'}</td>
                    <td className="py-3 px-4 text-zinc-400">{v.parcela1 ? formatDate(v.parcela1.vencimento) : '--'}</td>
                    <td className="py-3 px-4 text-zinc-400">{v.vencimentoStatus}</td>

                    <td className="py-3 px-4 text-amber-200">{v.parcela2 ? formatCurrency(v.parcela2.valor) : '--'}</td>
                    <td className="py-3 px-4 text-zinc-400">{v.parcela2 ? formatDate(v.parcela2.vencimento) : '--'}</td>

                    <td className="py-3 px-4 text-amber-200">{v.parcela3 ? formatCurrency(v.parcela3.valor) : '--'}</td>
                    <td className="py-3 px-4 text-zinc-400">{v.parcela3 ? formatDate(v.parcela3.vencimento) : '--'}</td>

                    <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                            {v.statusComissao}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="py-4 px-6 border-t border-zinc-800/60 bg-zinc-900/30 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Página <span className="font-semibold text-zinc-300">{currentPage}</span> de <span className="font-semibold text-zinc-300">{totalPaginas}</span>
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading}
              className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPaginas || loading}
              className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && vendas.length > 0 && (
          <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
