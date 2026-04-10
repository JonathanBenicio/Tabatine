// src/store/useEtapasStore.ts
import { create } from 'zustand';
import { mapSupabaseToEtapas } from '@/lib/etapas-mapper';

export interface EtapaPlana {
  id: string;
  codigo: string;
  descricao: string;
  descricaoPadrao: string;
  operacao: string;
  ativos: boolean;
  omieData?: any;
}

interface EtapasStoreState {
  etapas: EtapaPlana[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchEtapas: (page?: number, search?: string) => Promise<void>;
}

export const useEtapasStore = create<EtapasStoreState>((set, get) => ({
  etapas: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchEtapas: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: currentSearch
      });
      const response = await fetch(`/api/supabase/etapas-faturamento?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Etapas from Supabase');
      }

      const mapped = mapSupabaseToEtapas(data.registros);

      set({
        etapas: mapped,
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
