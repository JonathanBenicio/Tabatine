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
      const response = await fetch('/api/supabase/contas');
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
        totalPaginas: 1,
        totalRegistros: mappedContas.length,
        currentPage: 1,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
