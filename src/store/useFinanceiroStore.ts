'use client';

import { create } from 'zustand';
import { TituloFinanceiro } from '@/lib/financeiro-mapper';

interface FinanceiroState {
  // Contas a Pagar
  pagar: TituloFinanceiro[];
  pagarPage: number;
  pagarSearch: string;
  totalPagar: number;
  pagarTotalPaginas: number;

  // Contas a Receber
  receber: TituloFinanceiro[];
  receberPage: number;
  receberSearch: string;
  totalReceber: number;
  receberTotalPaginas: number;

  isLoading: boolean;
  error: string | null;

  // Actions
  setPagar: (data: TituloFinanceiro[], total: number, paginas: number) => void;
  setPagarPage: (page: number) => void;
  setPagarSearch: (search: string) => void;

  setReceber: (data: TituloFinanceiro[], total: number, paginas: number) => void;
  setReceberPage: (page: number) => void;
  setReceberSearch: (search: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFinanceiroStore = create<FinanceiroState>((set) => ({
  pagar: [],
  pagarPage: 1,
  pagarSearch: '',
  totalPagar: 0,
  pagarTotalPaginas: 1,

  receber: [],
  receberPage: 1,
  receberSearch: '',
  totalReceber: 0,
  receberTotalPaginas: 1,

  isLoading: false,
  error: null,

  setPagar: (pagar, totalPagar, pagarTotalPaginas) => set({ pagar, totalPagar, pagarTotalPaginas, isLoading: false }),
  setPagarPage: (pagarPage) => set({ pagarPage }),
  setPagarSearch: (pagarSearch) => set({ pagarSearch, pagarPage: 1 }),

  setReceber: (receber, totalReceber, receberTotalPaginas) => set({ receber, totalReceber, receberTotalPaginas, isLoading: false }),
  setReceberPage: (receberPage) => set({ receberPage }),
  setReceberSearch: (receberSearch) => set({ receberSearch, receberPage: 1 }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));
