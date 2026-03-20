import { useQuery } from '@tanstack/react-query'
import { Produto } from '@/store/useProdutosStore'
import { SortingState } from '@tanstack/react-table'

interface FetchProdutosResponse {
  produtos: Produto[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

interface ProdutosFilters {
  familia?: string
  status?: string
}

export const useProdutosQuery = (
  page: number, 
  search: string, 
  sorting: SortingState,
  filters: ProdutosFilters
) => {
  return useQuery<FetchProdutosResponse>({
    queryKey: ['produtos', page, search, sorting, filters],
    queryFn: async () => {
      const sortField = sorting[0]?.id || 'descricao'
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc'

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        sortField: sortField,
        sortOrder: sortOrder,
        ...(filters.familia && { familia: filters.familia }),
        ...(filters.status && { status: filters.status }),
      })
      const response = await fetch(`/api/supabase/produtos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch produtos')
      }

      const mappedProdutos = (data.produtos || []).map((p: any) => ({
        codigo_produto: p.OmieId,
        codigo: p.CodigoProduto,
        descricao: p.Descricao,
        unidade: p.UnidadeMedida,
        valor_unitario: Number(p.PrecoUnitario || 0),
        ncm: p.Ncm,
        excluido: p.Ativo ? 'N' : 'S'
      }))

      return {
        produtos: mappedProdutos,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      }
    },
    placeholderData: (previousData) => previousData,
  })
}
