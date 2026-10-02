// src/store/useMeiosStore.ts
import { create } from 'zustand';
import { mapSupabaseToMeios } from '@/lib/meios-mapper';

export interface MeioPlano {
  id: string;
  codigo: string;
  descricao: string;
  omieData?: Record<string, unknown>;
}

interface MeiosStoreState {
  meios: MeioPlano[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchMeios: (page?: number, search?: string) => Promise<void>;
}

export const useMeiosStore = create<MeiosStoreState>((set, get) => ({
  meios: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchMeios: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: currentSearch
      });
      const response = await fetch(`/api/supabase/meios-pagamento?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Meios de Pagamento');
      }

      const mapped = mapSupabaseToMeios(data.registros);

      set({
        meios: mapped,
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
