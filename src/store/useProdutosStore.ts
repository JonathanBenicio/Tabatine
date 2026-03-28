import { create } from 'zustand'
import { SortingState, VisibilityState } from '@tanstack/react-table'

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

interface ProdutosFilters {
  familia?: string
  status?: string
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
  sorting: SortingState
  columnVisibility: VisibilityState
  filters: ProdutosFilters
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  setSorting: (sorting: SortingState) => void
  setColumnVisibility: (visibility: VisibilityState) => void
  setFilters: (filters: ProdutosFilters) => void
  fetchProdutos: (page?: number) => Promise<void>
  fetchProdutoByOmieId: (omieId: number) => Promise<Produto | null>
}

// ── Dedup Helper ──────────────────────────────────────────
const fetchingPromises = new Map<number, Promise<Produto | null>>();

export const useProdutosStore = create<ProdutosStoreState>((set, get) => ({
  produtos: [],
  loading: false,
  error: null,
  hasFetchedInitial: false,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  sorting: [{ id: 'descricao', desc: false }],
  columnVisibility: {},
  filters: {},

  setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setSorting: (sorting: SortingState) => set({ sorting, currentPage: 1 }),
  setColumnVisibility: (columnVisibility: VisibilityState) => set({ columnVisibility }),
  setFilters: (filters: ProdutosFilters) => set({ filters, currentPage: 1 }),

  fetchProdutos: async (page = 1) => {
    const { searchTerm, sorting, filters } = get()
    set({ loading: true, error: null, hasFetchedInitial: true })

    try {
      const sortField = sorting[0]?.id || 'descricao'
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc'

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        sortField: sortField,
        sortOrder: sortOrder,
        ...(filters.familia && { familia: filters.familia }),
        ...(filters.status && { status: filters.status }),
      })
      
      const response = await fetch(`/api/supabase/produtos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch produtos from Supabase')
      }

      const mappedProdutos = (data.produtos || []).map((p: any) => ({
        codigo_produto: p.OmieId,
        codigo_produto_integracao: p.CodigoProdutoIntegracao,
        codigo: p.CodigoProduto,
        descricao: p.Descricao,
        unidade: p.UnidadeMedida,
        valor_unitario: Number(p.PrecoUnitario || 0),
        ncm: p.Ncm,
        ean: p.Ean,
        peso_bruto: Number(p.PesoBruto || 0),
        peso_liquido: Number(p.PesoLiquido || 0),
        familia_produto: p.FamiliaProduto,
        excluido: p.Ativo ? 'N' : 'S'
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

  fetchProdutoByOmieId: async (omieId: number) => {
    // 1. Check cache
    const existing = get().produtos.find(p => p.codigo_produto === omieId)
    if (existing) return existing

    // 2. Check if already fetching
    if (fetchingPromises.has(omieId)) {
      return fetchingPromises.get(omieId)!;
    }

    set({ loading: true, error: null })
    
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/supabase/produtos?omieId=${omieId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch produto by OmieId')
        }

        const p = data.produtos?.[0]
        if (!p) return null

        const mapped: Produto = {
          codigo_produto: p.OmieId,
          codigo_produto_integracao: p.CodigoProdutoIntegracao,
          codigo: p.CodigoProduto,
          descricao: p.Descricao,
          unidade: p.UnidadeMedida,
          valor_unitario: Number(p.PrecoUnitario || 0),
          ncm: p.Ncm,
          ean: p.Ean,
          peso_bruto: Number(p.PesoBruto || 0),
          peso_liquido: Number(p.PesoLiquido || 0),
          familia_produto: p.FamiliaProduto,
          excluido: p.Ativo ? 'N' : 'S'
        }

        set(state => ({ 
          produtos: [...state.produtos.filter(item => item.codigo_produto !== omieId), mapped],
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
