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
      const response = await fetch('/api/omie/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarVendedores',
          param: [
            {
              pagina: page,
              registros_por_pagina: 20,
              apenas_importado_api: 'N',
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendedores');
      }

      set({
        vendedores: data.cadastro || [],
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
