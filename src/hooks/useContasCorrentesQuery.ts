import { useQuery } from '@tanstack/react-query'
import { ContaCorrente } from '@/store/useContasCorrentesStore'
import { mapSupabaseToContasCorrentes } from '@/lib/contas-mapper'
import { SortingState } from '@tanstack/react-table'

interface FetchContasResponse {
  contas: ContaCorrente[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useContasCorrentesQuery = (page: number, search: string, sorting: SortingState = []) => {
  return useQuery<FetchContasResponse>({
    queryKey: ['contas-correntes', page, search, sorting],
    queryFn: async () => {
      const sortField = sorting.length > 0 ? sorting[0].id : 'descricao';
      const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'asc';
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        sortField,
        sortOrder
      })
      const response = await fetch(`/api/supabase/contas?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Contas Correntes')
      }

      const mappedContas = mapSupabaseToContasCorrentes(data.contas);

      return {
        contas: mappedContas,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      }
    },
    placeholderData: (previousData) => previousData,
  })
}
