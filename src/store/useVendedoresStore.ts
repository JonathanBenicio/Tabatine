import { create } from 'zustand'
import { mapSupabaseToVendedores, mapSupabaseToVendedor } from '@/lib/vendedores-mapper'

export interface Vendedor {
  codigo: number
  codInt: string
  nome: string
  email: string
  comissao: number
  inativo: string
  fatura_pedido: string
  visualiza_pedido: string
}

interface VendedoresStoreState {
  vendedores: Vendedor[]
  loading: boolean
  error: string | null
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  fetchVendedores: (page?: number, search?: string) => Promise<void>
  fetchVendedorByCodigo: (codigo: number) => Promise<Vendedor | null>
}

// ── Dedup Helper ──────────────────────────────────────────
const fetchingPromises = new Map<number, Promise<Vendedor | null>>();

export const useVendedoresStore = create<VendedoresStoreState>((set, get) => ({
  vendedores: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchVendedores: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: currentSearch
      })
      const response = await fetch(`/api/supabase/vendedores?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendedores from Supabase')
      }

      const mappedVendedores = mapSupabaseToVendedores(data.vendedores);

      set({
        vendedores: mappedVendedores,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  fetchVendedorByCodigo: async (codigo: number) => {
    // 1. Check if we already have it in the list
    const existing = get().vendedores.find(v => v.codigo === codigo)
    if (existing) return existing

    // 2. Check if already fetching
    if (fetchingPromises.has(codigo)) {
      return fetchingPromises.get(codigo)!;
    }

    set({ loading: true, error: null })
    
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/supabase/vendedores?codigo=${codigo}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch Vendedor details')
        }

        if (data.vendedores && data.vendedores.length > 0) {
          const mapped = mapSupabaseToVendedor(data.vendedores[0]);
          
          set(state => ({
            vendedores: [...state.vendedores.filter(item => item.codigo !== mapped.codigo), mapped],
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
        fetchingPromises.delete(codigo);
      }
    })();

    fetchingPromises.set(codigo, fetchPromise);
    return fetchPromise;
  },
}))
