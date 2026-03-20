import { create } from 'zustand'

export interface Produto {
  codigo_produto: number
  codigo_produto_integracao: string
  codigo: string
  descricao: string
  unidade: string
  valor_unitario: number
  ncm: string
  ean?: string
  peso_bruto?: number
  peso_liquido?: number
  familia_produto?: string
  excluido: 'S' | 'N'
}

interface ProdutosStoreState {
  produtos: Produto[]
  loading: boolean
  error: string | null
  hasFetchedInitial: boolean
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  fetchProdutos: (page?: number, search?: string) => Promise<void>
}

export const useProdutosStore = create<ProdutosStoreState>((set, get) => ({
  produtos: [],
  loading: false,
  error: null,
  hasFetchedInitial: false,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchProdutos: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm
    set({ loading: true, error: null, hasFetchedInitial: true })

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: currentSearch
      })
      const response = await fetch(`/api/supabase/produtos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch produtos from Supabase')
      }

      const mappedProdutos = (data.produtos || []).map((p: any) => ({
        codigo_produto: p.OmieId,
        codigo: p.CodigoProduto,
        descricao: p.Descricao,
        unidade: p.UnidadeMedida,
        valor_unitario: p.ValorUnitario,
        ncm: p.Ncm,
        ean: p.Ean,
        peso_bruto: Number(p.PesoBruto || 0),
        peso_liquido: Number(p.PesoLiquido || 0),
        familia_produto: p.FamiliaProduto,
        excluido: p.Ativo === false ? 'S' : 'N'
      }))

      set({
        produtos: mappedProdutos,
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
