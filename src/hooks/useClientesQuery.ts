import { useQuery } from '@tanstack/react-query'
import { ClienteCadastro } from '@/store/useClienteStore'
import { mapSupabaseToClientes } from '@/lib/clientes-mapper'

interface FetchClientesResponse {
  clientes: ClienteCadastro[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useClientesQuery = (page: number, search: string) => {
  return useQuery<FetchClientesResponse>({
    queryKey: ['clientes', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      })
      const response = await fetch(`/api/supabase/clientes?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Clientes')
      }

      const mappedClientes = mapSupabaseToClientes(data.clientes);

      return {
        clientes: mappedClientes,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      }
    },
    placeholderData: (previousData) => previousData,
  })
}
