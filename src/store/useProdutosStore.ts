import { create } from 'zustand';

export interface Produto {
  codigo_produto: number;
  codigo_produto_integracao: string;
  codigo: string;
  descricao: string;
  unidade: string;
  valor_unitario: number;
  ncm: string;
  excluido: 'S' | 'N';
}

interface ProdutosStoreState {
  produtos: Produto[];
  loading: boolean;
  error: string | null;
  hasFetchedInitial: boolean;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchProdutos: (page?: number, forceRefresh?: boolean) => Promise<void>;
}

export const useProdutosStore = create<ProdutosStoreState>((set, get) => ({
  produtos: [],
  loading: false,
  error: null,
  hasFetchedInitial: false,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchProdutos: async (page = 1, forceRefresh = false) => {
    if (page === get().currentPage && get().hasFetchedInitial && !forceRefresh) return;

    set({ loading: true, error: null, hasFetchedInitial: true });
    
    try {
      const response = await fetch(`/api/supabase/produtos?page=${page}&limit=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch produtos from Supabase');
      }

      const mappedProdutos = (data.produtos || []).map((p: any) => ({
        codigo_produto: p.OmieId,
        codigo: p.CodigoProduto,
        descricao: p.Descricao,
        unidade: p.UnidadeMedida,
        valor_unitario: p.ValorUnitario,
        ncm: p.Ncm,
        excluido: 'N'
      }));
      
      set({
        produtos: mappedProdutos,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
