import { useQuery } from '@tanstack/react-query'
import { Produto } from '@/store/useProdutosStore'

interface FetchProdutosResponse {
  produtos: Produto[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useProdutosQuery = (page: number, search: string) => {
  return useQuery<FetchProdutosResponse>({
    queryKey: ['produtos', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
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
        valor_unitario: p.ValorUnitario,
        ncm: p.Ncm,
        excluido: 'N'
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
