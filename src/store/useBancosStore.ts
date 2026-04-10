import { create } from 'zustand';
import { mapSupabaseToBancos, mapSupabaseToBanco } from '@/lib/bancos-mapper';

export interface BancoPlano {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  ispb: string;
  omieData?: any;
}

interface BancosStoreState {
  bancos: BancoPlano[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchBancos: (page?: number, search?: string) => Promise<void>;
  fetchBancoById: (id: string) => Promise<BancoPlano | null>;
}

export const useBancosStore = create<BancosStoreState>((set, get) => ({
  bancos: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchBancos: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: currentSearch
      });
      const response = await fetch(`/api/supabase/bancos?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Bancos from Supabase');
      }

      const mapped = mapSupabaseToBancos(data.registros);

      set({
        bancos: mapped,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchBancoById: async (id: string) => {
    // Check cache first
    const cached = get().bancos.find(b => b.id === id);
    if (cached) return cached;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/supabase/bancos/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Banco não encontrado');
      }

      const mapped = mapSupabaseToBanco(data.banco);
      set({ loading: false });
      return mapped;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
}));
