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
  fetchContas: (page?: number) => Promise<void>;
}

export const useContasCorrentesStore = create<ContasCorrentesStoreState>((set, get) => ({
  contas: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchContas: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/omie/contas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarContasCorrentes',
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
        throw new Error(data.error || 'Failed to fetch Contas Correntes');
      }

      set({
        contas: data.ListarContasCorrentes || [],
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
