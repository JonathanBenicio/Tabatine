// src/store/useCondicoesStore.ts
import { create } from 'zustand';
import { mapSupabaseToCondicoes } from '@/lib/condicoes-mapper';

export interface CondicaoPlana {
  id: string;
  codigo: string;
  descricao: string;
  parcelas: number;
  ativos: boolean;
  omieData?: Record<string, unknown>;
}

interface CondicoesStoreState {
  condicoes: CondicaoPlana[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchCondicoes: (page?: number, search?: string) => Promise<void>;
}

export const useCondicoesStore = create<CondicoesStoreState>((set, get) => ({
  condicoes: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchCondicoes: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: currentSearch
      });
      const response = await fetch(`/api/supabase/condicoes-pagamento?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Condições from Supabase');
      }

      const mapped = mapSupabaseToCondicoes(data.registros);

      set({
        condicoes: mapped,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
