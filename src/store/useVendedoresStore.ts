import { create } from 'zustand'

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
}

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

      const mappedVendedores = (data.vendedores || []).map((v: any) => ({
        codigo: v.OmieId,
        nome: v.Nome,
        email: v.Email,
        comissao: v.Comissao,
        inativo: v.Inativo ? 'S' : 'N'
      }))

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
}))
