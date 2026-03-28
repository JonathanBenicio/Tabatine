import { create } from 'zustand'
import { mapSupabaseToContasCorrentes, mapSupabaseToContaCorrente } from '@/lib/contas-mapper';

export interface ContaCorrente {
  nCodCC: number
  descricao: string
  codigo_banco: string
  codigo_agencia: string
  numero_conta_corrente: string
  tipo: string
  tipo_conta_corrente: string
  inativo: string
  saldo_inicial: number
  pdv_enviar: string
  codigo_integracao?: string
  omie_updated_at?: string
}

interface ContasCorrentesStoreState {
  contas: ContaCorrente[]
  loading: boolean
  error: string | null
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  fetchContas: (page?: number, search?: string) => Promise<void>
  fetchContaByCodCC: (nCodCC: number) => Promise<ContaCorrente | null>
}

// ── Dedup Helper ──────────────────────────────────────────
const fetchingPromises = new Map<number, Promise<ContaCorrente | null>>();

export const useContasCorrentesStore = create<ContasCorrentesStoreState>((set, get) => ({
  contas: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchContas: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: currentSearch
      })
      const response = await fetch(`/api/supabase/contas?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Contas Correntes from Supabase')
      }

      const mappedContas = mapSupabaseToContasCorrentes(data.contas);

      set({
        contas: mappedContas,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchContaByCodCC: async (nCodCC: number) => {
    // 1. Check if we already have it in the list
    const existing = get().contas.find(c => c.nCodCC === nCodCC)
    if (existing) return existing

    // 2. Check if already fetching
    if (fetchingPromises.has(nCodCC)) {
      return fetchingPromises.get(nCodCC)!;
    }

    set({ loading: true, error: null })
    
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/supabase/contas?omieId=${nCodCC}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch Conta Corrente details')
        }

        if (data.contas && data.contas.length > 0) {
          const mapped = mapSupabaseToContaCorrente(data.contas[0]);
          
          set(state => ({
            contas: [...state.contas.filter(item => item.nCodCC !== mapped.nCodCC), mapped],
            loading: false
          }))
          return mapped
        }
        set({ loading: false })
        return null
      } catch (error: any) {
        set({ error: error.message, loading: false })
        return null
      } finally {
        fetchingPromises.delete(nCodCC);
      }
    })();

    fetchingPromises.set(nCodCC, fetchPromise);
    return fetchPromise;
  },
}))
