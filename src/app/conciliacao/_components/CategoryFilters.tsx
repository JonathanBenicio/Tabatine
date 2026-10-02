import React from "react";
import { Filter } from "lucide-react";

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilters({ categories, selectedCategory, onSelectCategory }: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
        <Filter size={12} />
        Filtrar:
      </div>
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${!selectedCategory ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white'}`}
      >
        Todas
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white'}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
