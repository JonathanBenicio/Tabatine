import { create } from 'zustand';

export interface NFQueryParam {
  pagina: number;
  registros_por_pagina: number;
  apenas_importado_api: string;
  // Other filters could be added here
}

export interface NfCadastro {
  id_nf: number;
  numero_nf: string;
  data_emissao: string;
  status_nf: string;
  razao_social: string;
  valor_total_nf: number;
  [key: string]: any; // Allow other properties
}

interface NfStoreState {
  nfs: NfCadastro[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchNfs: (page?: number) => Promise<void>;
}

export const useNfStore = create<NfStoreState>((set, get) => ({
  nfs: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchNfs: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/omie/nf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarNF',
          app_key: '', // Handled by server
          app_secret: '', // Handled by server
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
        throw new Error(data.error || 'Failed to fetch NFs');
      }

      set({
        nfs: data.nfCadastro || [],
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
