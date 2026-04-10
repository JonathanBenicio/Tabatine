// src/store/useFormasStore.ts
import { create } from 'zustand';
import { mapSupabaseToFormas } from '@/lib/formas-mapper';

export interface FormaPlana {
  id: string;
  codigo: string;
  descricao: string;
  quantidadeParcelas: number;
  diasParcelas: number;
  listaParcelas: string;
  omieData?: any;
}

interface FormasStoreState {
  formas: FormaPlana[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchFormas: (page?: number, search?: string) => Promise<void>;
}

export const useFormasStore = create<FormasStoreState>((set, get) => ({
  formas: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchFormas: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: currentSearch
      });
      const response = await fetch(`/api/supabase/formas-pagamento?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Formas de Pagamento');
      }

      const mapped = mapSupabaseToFormas(data.registros);

      set({
        formas: mapped,
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
