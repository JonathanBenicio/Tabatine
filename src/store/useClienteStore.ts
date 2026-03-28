import { create } from 'zustand'
import { mapSupabaseToClientes, mapSupabaseToCliente } from '@/lib/clientes-mapper'

export interface ClienteCadastro {
  codigo_cliente_omie: number
  codigo_cliente_integracao: string
  razao_social: string
  nome_fantasia: string
  cnpj_cpf: string
  telefone1_ddd: string
  telefone1_numero: string
  email: string
  cidade: string
  estado: string
  bairro?: string
  endereco?: string
  endereco_numero?: string
  endereco_complemento?: string
  inscricao_estadual?: string
  inscricao_municipal?: string
  optante_simples_nacional?: boolean
  tags: { tag: string }[]
  [key: string]: any
}

interface ClienteStoreState {
  clientes: ClienteCadastro[]
  loading: boolean
  error: string | null
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  fetchClientes: (page?: number, search?: string) => Promise<void>
  fetchClienteByOmieId: (omieId: number) => Promise<ClienteCadastro | null>
}

// ── Dedup Helper ──────────────────────────────────────────
const fetchingPromises = new Map<number, Promise<ClienteCadastro | null>>();

export const useClienteStore = create<ClienteStoreState>((set, get) => ({
  clientes: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchClientes: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: currentSearch
      })
      const response = await fetch(`/api/supabase/clientes?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Clientes from Supabase')
      }

      const mappedClientes = mapSupabaseToClientes(data.clientes);

      set({
        clientes: mappedClientes,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchClienteByOmieId: async (omieId: number) => {
    // 1. Check cache
    const existing = get().clientes.find(c => c.codigo_cliente_omie === omieId)
    if (existing) return existing

    // 2. Check if already fetching
    if (fetchingPromises.has(omieId)) {
      return fetchingPromises.get(omieId)!;
    }

    set({ loading: true, error: null })
    
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/supabase/clientes?omieId=${omieId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch Cliente by OmieId')
        }

        const c = data.clientes?.[0]
        if (!c) return null

        const mapped = mapSupabaseToCliente(data.clientes?.[0]);

        set(state => ({ 
          clientes: [...state.clientes.filter(item => item.codigo_cliente_omie !== omieId), mapped],
          loading: false 
        }))

        return mapped
      } catch (error: any) {
        set({ error: error.message, loading: false })
        return null
      } finally {
        fetchingPromises.delete(omieId);
      }
    })();

    fetchingPromises.set(omieId, fetchPromise);
    return fetchPromise;
  },
}))
