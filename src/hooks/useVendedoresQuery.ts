import { useQuery } from '@tanstack/react-query'
import { Vendedor } from '@/store/useVendedoresStore'
import { mapSupabaseToVendedores } from '@/lib/vendedores-mapper'
import { SortingState } from '@tanstack/react-table'

interface FetchVendedoresResponse {
  vendedores: Vendedor[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useVendedoresQuery = (page: number, search: string, sorting?: SortingState) => {
  return useQuery<FetchVendedoresResponse>({
    queryKey: ['vendedores', page, search, sorting],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        sortField: sorting?.[0]?.id || 'nome',
        sortOrder: sorting?.[0]?.desc ? 'desc' : 'asc'
      })
      const response = await fetch(`/api/supabase/vendedores?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch vendedores')
      }

      const mappedVendedores = mapSupabaseToVendedores(data.vendedores);

      return {
        vendedores: mappedVendedores,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      }
    },
    placeholderData: (previousData) => previousData,
  })
}
