import React from 'react';
import { RefreshCw, LucideIcon } from 'lucide-react';

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  pagination?: React.ReactNode;
}

export function TableContainer({ 
  children, 
  className = '', 
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'Nenhum dado encontrado',
  emptyIcon: EmptyIcon,
  pagination
}: TableContainerProps) {
  return (
    <div className={`group relative rounded-3xl border border-white/60 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col ${className}`}>
      
      {/* Content Area */}
      <div className="relative flex-1 overflow-auto custom-scrollbar">
        {isEmpty && !isLoading ? (
          <div className="py-24 px-6 text-center">
            <div className="flex flex-col items-center justify-center gap-4 group/icon">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-700 group-hover/icon:text-slate-600 dark:group-hover/icon:text-zinc-500 transition-colors">
                {EmptyIcon ? <EmptyIcon size={32} /> : <RefreshCw size={32} />}
              </div>
              <p className="text-slate-500 dark:text-zinc-400 font-medium">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center z-20 transition-all duration-300">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mt-4">Carregando...</p>
          </div>
        )}
      </div>

      {/* Pagination Area */}
      {pagination && (
        <div className="border-t border-slate-200 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30">
          {pagination}
        </div>
      )}
    </div>
  );
}
