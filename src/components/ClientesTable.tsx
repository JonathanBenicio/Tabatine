'use client';

import React, { useEffect } from 'react';
import { useClienteStore } from '@/store/useClienteStore';
import { Search, ChevronLeft, ChevronRight, Users as UsersIcon, AlertCircle, RefreshCw } from 'lucide-react';

export default function ClientesTable() {
  const { clientes, loading, error, currentPage, totalPaginas, totalRegistros, fetchClientes } = useClienteStore();

  useEffect(() => {
    fetchClientes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextPage = () => {
    if (currentPage < totalPaginas) fetchClientes(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchClientes(currentPage - 1);
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Nossos Clientes
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Visualize e cadastre os clientes sincronizados.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className="pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 focus:border-blue-500/50 rounded-xl text-sm placeholder:text-zinc-500 outline-none w-64 transition-all focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <button 
            onClick={() => fetchClientes(1)} 
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
            <p className="font-semibold">Erro ao consultar clientes</p>
            <p className="opacity-80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Info Card Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-medium pb-1 uppercase tracking-wider">Total de Clientes</p>
            <p className="text-2xl font-semibold">{totalRegistros}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Razão Social / Nome Fantasia</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">CNPJ/CPF</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Contato</th>
                <th className="py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading && clientes.length === 0 ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                        <div className="h-4 bg-zinc-800 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-zinc-800/50 rounded w-32"></div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-28"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-zinc-800 rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-zinc-800 rounded-full w-20"></div></td>
                  </tr>
                ))
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-6 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <UsersIcon className="w-10 h-10 opacity-20" />
                      <p>Nenhum cliente encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clientes.map((cliente, idx) => (
                  <tr 
                    key={cliente.codigo_cliente_omie || idx} 
                    className="hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-white">{cliente.razao_social}</p>
                      {cliente.nome_fantasia && cliente.nome_fantasia !== cliente.razao_social && (
                        <p className="text-xs text-zinc-400 mt-1">{cliente.nome_fantasia}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-300">
                      {cliente.cnpj_cpf || 'Não Informado'}
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-300">
                        {cliente.telefone1_ddd && cliente.telefone1_numero ? `(${cliente.telefone1_ddd}) ${cliente.telefone1_numero}` : '--'}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {cliente.tags?.length > 0 ? cliente.tags.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] uppercase font-semibold">
                                {t.tag}
                            </span>
                        )) : (
                            <span className="text-zinc-500 italic text-xs">Sem tags</span>
                        )}
                      </div>
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

        {/* Loading Overlay */}
        {loading && clientes.length > 0 && (
          <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
