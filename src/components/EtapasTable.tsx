'use client';

import React, { useEffect, useState } from 'react';
import { useEtapasStore } from '@/store/useEtapasStore';
import { Layers, Search, Workflow } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function EtapasTable() {
  const { 
    etapas, 
    loading, 
    error, 
    fetchEtapas, 
    searchTerm, 
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPaginas,
    totalRegistros
  } = useEtapasStore();

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [debouncedSearch] = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch);
      setCurrentPage(1);
    }
  }, [debouncedSearch, searchTerm, setSearchTerm, setCurrentPage]);

  useEffect(() => {
    fetchEtapas(currentPage, debouncedSearch);
  }, [fetchEtapas, currentPage, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPaginas) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-400" />
            Etapas de Faturamento
          </h1>
          <p className="text-slate-400 mt-1">Configure o fluxo e as naturezas de operação de suas vendas.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/20">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-800/80 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
              placeholder="Buscar por descrição ou código..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-6 text-center text-red-400 bg-red-400/10">
            Houve um erro ao carregar as etapas: {error}
          </div>
        )}

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : etapas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Layers className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma etapa encontrada</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-800/40">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Código / Etapa
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">
                    Descrição Padrão
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Operação Vinculada
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-800/10">
                {etapas.map((etapa) => (
                  <tr 
                    key={etapa.id} 
                    className={`hover:bg-slate-700/30 transition-colors cursor-default ${!etapa.ativos ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-blue-400">
                          #{etapa.codigo}
                        </span>
                        <span className="text-sm font-medium text-white">{etapa.descricao}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-slate-300">{etapa.descricaoPadrao}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-slate-300 max-w-xs">
                        <Workflow className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{etapa.operacao}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${etapa.ativos ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                        {etapa.ativos ? 'Ativo' : 'Inativa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && etapas.length > 0 && (
          <div className="bg-slate-800/40 px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Mostrando página <span className="font-medium text-white">{currentPage}</span> de{' '}
              <span className="font-medium text-white">{totalPaginas}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700/50 disabled:opacity-50 hover:bg-slate-700 text-sm font-medium text-white rounded-lg transition-colors border border-slate-600/50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPaginas}
                className="px-4 py-2 bg-slate-700/50 disabled:opacity-50 hover:bg-slate-700 text-sm font-medium text-white rounded-lg transition-colors border border-slate-600/50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
