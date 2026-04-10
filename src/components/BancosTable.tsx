'use client';

import React, { useEffect, useState } from 'react';
import { useBancosStore } from '@/store/useBancosStore';
import { Landmark, Search, ChevronRight } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/navigation';

export default function BancosTable() {
  const { 
    bancos, 
    loading, 
    error, 
    fetchBancos, 
    searchTerm, 
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPaginas,
    totalRegistros
  } = useBancosStore();

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [debouncedSearch] = useDebounce(localSearch, 500);
  const router = useRouter();

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch);
      setCurrentPage(1);
    }
  }, [debouncedSearch, searchTerm, setSearchTerm, setCurrentPage]);

  // Initial load or pagination/search change
  useEffect(() => {
    fetchBancos(currentPage, debouncedSearch);
  }, [fetchBancos, currentPage, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPaginas) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Landmark className="w-8 h-8 text-blue-400" />
            Bancos
          </h1>
          <p className="text-slate-400 mt-1">Gerencie os bancos cadastrados via ERP.</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/20">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-800/80 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
              placeholder="Buscar por código ou nome..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="p-6 text-center text-red-400 bg-red-400/10">
            Houve um erro ao carregar os bancos: {error}
          </div>
        )}

        {/* Loading / Empty / Data */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : bancos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Landmark className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum banco encontrado</p>
              <p className="text-sm">Tente ajustar sua busca.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead className="bg-slate-800/40">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Código Banco
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">
                    Código ISPB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-800/10">
                {bancos.map((banco) => (
                  <tr 
                    key={banco.id}
                    onClick={() => router.push(`/bancos/${banco.id}`)}
                    className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-sm font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                          {banco.codigo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{banco.nome}</div>
                      <div className="text-xs text-slate-400 md:hidden mt-1">ISPB: {banco.ispb}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-slate-300">{banco.ispb}</span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && bancos.length > 0 && (
          <div className="bg-slate-800/40 px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Mostrando página <span className="font-medium text-white">{currentPage}</span> de{' '}
              <span className="font-medium text-white">{totalPaginas}</span>
              <span className="ml-2">({totalRegistros} total)</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 text-sm font-medium text-white rounded-lg transition-colors border border-slate-600/50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPaginas}
                className="px-4 py-2 bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 text-sm font-medium text-white rounded-lg transition-colors border border-slate-600/50"
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
