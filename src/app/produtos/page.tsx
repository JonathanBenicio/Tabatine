'use client';

import React, { useEffect } from 'react';
import { useProdutosStore } from '../../store/useProdutosStore';
import ProdutosTable from '../../components/ProdutosTable';
import { Package, Plus } from 'lucide-react';

export default function ProdutosPage() {
  const { fetchProdutos, totalRegistros } = useProdutosStore();

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Produtos</h1>
          </div>
          <p className="text-zinc-500 text-sm max-w-2xl">
            Gerencie o catálogo de produtos integrados com a Omie. Visualize preços, SKUs e detalhes técnicos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
            <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Total em Catálogo</p>
            <p className="text-xl font-bold text-white tracking-tight">{totalRegistros.toLocaleString('pt-BR')}</p>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <ProdutosTable />
    </div>
  );
}
