import { create } from 'zustand';

export interface ContaCorrente {
  nCodCC: number;
  descricao: string;
  codigo_banco: string;
  codigo_agencia: string;
  numero_conta_corrente: string;
  tipo: string;
  tipo_conta_corrente: string;
  inativo: string;
  saldo_inicial: number;
  pdv_enviar: string;
}

interface ContasCorrentesStoreState {
  contas: ContaCorrente[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchContas: (page?: number, search?: string) => Promise<void>;
}

export const useContasCorrentesStore = create<ContasCorrentesStoreState>((set, get) => ({
  contas: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),

  fetchContas: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm;
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        search: currentSearch
      });
      const response = await fetch(`/api/supabase/contas?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Contas Correntes from Supabase');
      }

      const mappedContas = (data.contas || []).map((c: any) => ({
        nCodCC: c.OmieId,
        descricao: c.Descricao,
        codigo_banco: c.CodigoBanco,
        codigo_agencia: c.CodigoAgencia,
        numero_conta_corrente: c.NumeroContaCorrente,
        tipo: c.Tipo,
        tipo_conta_corrente: c.TipoContaCorrente,
        inativo: c.Inativo ? 'S' : 'N'
      }));

      set({
        contas: mappedContas,
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
