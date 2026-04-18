import React from 'react';
import { Search, Loader2 } from 'lucide-react';

export interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function TableSearch({ 
  value, 
  onChange, 
  placeholder = "Pesquisar...", 
  className = "",
  isLoading = false,
}: TableSearchProps) {
  const id = React.useId();
  return (
    <div className={`relative group ${className}`}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-orange-500 dark:text-orange-400 absolute left-3 top-1/2 -translate-y-1/2 animate-spin" />
      ) : (
        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400 transition-colors" />
      )}
      <input 
        id={id}
        data-testid="table-search-input"
        type="text" 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2.5 bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 focus:border-orange-500/40 rounded-xl text-sm placeholder:text-slate-500 dark:placeholder:text-zinc-600 text-slate-900 dark:text-white outline-none w-full transition-all focus:ring-4 focus:ring-orange-500/5 backdrop-blur-sm"
      />
    </div>
  );
}
