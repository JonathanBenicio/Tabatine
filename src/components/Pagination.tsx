'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPaginas: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPaginas, 
  onPageChange, 
  loading = false 
}: PaginationProps) {
  if (totalPaginas <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPaginas <= maxVisiblePages) {
      for (let i = 1; i <= totalPaginas; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPaginas, start + maxVisiblePages - 1);

      if (end === totalPaginas) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-8 border-t border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Página <span className="text-white font-black">{currentPage}</span> de <span className="text-zinc-400">{totalPaginas}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {pages[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                1
              </button>
              {pages[0] > 2 && <MoreHorizontal className="w-4 h-4 text-zinc-600 mx-1" />}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all text-xs font-bold ${
                currentPage === page
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {page}
            </button>
          ))}

          {pages[pages.length - 1] < totalPaginas && (
            <>
              {pages[pages.length - 1] < totalPaginas - 1 && <MoreHorizontal className="w-4 h-4 text-zinc-600 mx-1" />}
              <button
                onClick={() => onPageChange(totalPaginas)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                {totalPaginas}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPaginas || loading}
          className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Próximo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
