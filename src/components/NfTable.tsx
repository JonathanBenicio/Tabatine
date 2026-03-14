'use client';

import React, { useEffect } from 'react';
import { useNfStore } from '@/store/useNfStore';
import { Search, ChevronLeft, ChevronRight, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function NfTable() {
  const { nfs, loading, error, currentPage, totalPaginas, totalRegistros, fetchNfs } = useNfStore();

  useEffect(() => {
    fetchNfs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextPage = () => {
    if (currentPage < totalPaginas) fetchNfs(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchNfs(currentPage - 1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      // API typically returns DD/MM/YYYY or YYYY-MM-DD. Simple fallback:
      if (dateStr.includes('/')) return dateStr;
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Faturado':
      case 'Concluido':
        return <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-xs font-semibold tracking-wide">Faturado</span>;
      case 'Cancelado':
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-semibold tracking-wide">Cancelado</span>;
      case 'Aguardando':
      default:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold tracking-wide">{status || 'Pendente'}</span>;
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Notas Fiscais Emitidas
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Visualize e gerencie suas notas fiscais de venda.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por cliente/NF..." 
              className="pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-sm placeholder:text-zinc-500 outline-none w-64 transition-all focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <button 
            onClick={() => fetchNfs(1)} 
            className="p-2.5 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-400 items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Erro ao consultar notas fiscais</p>
            <p className="opacity-80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Info Card Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium pb-1 uppercase tracking-wider">Total de Registros</p>
            <p className="text-2xl font-semibold">{totalRegistros}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        {/* Placeholder cards for visuals */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex items-center justify-between opacity-50">
          <div>
            <p className="text-xs text-zinc-400 font-medium pb-1 uppercase tracking-wider">Volume Mensal</p>
            <p className="text-2xl font-semibold">R$ --,--</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
            <span className="font-serif italic font-bold">R$</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Data</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Nº NF-e</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Cliente</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono text-right">Valor Total</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading && nfs.length === 0 ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-20"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-48"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-24 ml-auto"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-zinc-800 rounded-full w-20"></div></td>
                  </tr>
                ))
              ) : nfs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="w-10 h-10 opacity-20" />
                      <p>Nenhuma nota fiscal encontrada.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                nfs.map((nf, idx) => (
                  <tr 
                    key={nf.id_nf || idx} 
                    className="hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6 text-sm text-zinc-300">
                      {formatDate(nf.data_emissao || nf.dEmissao)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-white">
                      #{nf.numero_nf || nf.cNumero || '---'}
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-300">
                      {nf.razao_social || nf.sNomeRazao || 'Cliente não informado'}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-white text-right">
                      {formatCurrency(nf.valor_total_nf || nf.nValorTotal || 0)}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {getStatusBadge(nf.status_nf || nf.cStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
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

        {/* Loading Overlay mapped conditionally when navigating pages to keep table context */}
        {loading && nfs.length > 0 && (
          <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
