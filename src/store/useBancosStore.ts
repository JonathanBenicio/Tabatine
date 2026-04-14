import { create } from 'zustand';
import { mapSupabaseToBancos, mapSupabaseToBanco } from '@/lib/bancos-mapper';

export interface BancoPlano {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  ispb: string;
  omieData?: Record<string, unknown>;
}

interface BancosStoreState {
  bancos: BancoPlano[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  sorting: { id: string; desc: boolean }[];
  setSorting: (sorting: { id: string; desc: boolean }[]) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  fetchBancos: (page?: number, search?: string, sortField?: string, sortOrder?: string) => Promise<void>;
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
  sorting: [{ id: 'codigo', desc: false }],
  setSorting: (sorting) => set({ sorting }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchBancos: async (page = 1, search, sortField, sortOrder) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    const currentSorting = get().sorting[0];
    const sField = sortField || currentSorting?.id || 'codigo';
    const sOrder = sortOrder || (currentSorting?.desc ? 'desc' : 'asc');

    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: currentSearch,
        sortField: sField,
        sortOrder: sOrder
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
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false });
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
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },
}));
