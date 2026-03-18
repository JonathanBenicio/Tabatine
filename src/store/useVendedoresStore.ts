import { create } from 'zustand';

export interface Vendedor {
  codigo: number;
  codInt: string;
  nome: string;
  email: string;
  comissao: number;
  inativo: string;
  fatura_pedido: string;
  visualiza_pedido: string;
}

interface VendedoresStoreState {
  vendedores: Vendedor[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchVendedores: (page?: number) => Promise<void>;
}

export const useVendedoresStore = create<VendedoresStoreState>((set, get) => ({
  vendedores: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchVendedores: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/supabase/vendedores');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendedores from Supabase');
      }

      const mappedVendedores = (data.vendedores || []).map((v: any) => ({
        codigo: v.OmieId,
        nome: v.Nome,
        email: v.Email,
        comissao: v.Comissao,
        inativo: v.Inativo ? 'S' : 'N'
      }));

      set({
        vendedores: mappedVendedores,
        totalPaginas: 1,
        totalRegistros: mappedVendedores.length,
        currentPage: 1,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
