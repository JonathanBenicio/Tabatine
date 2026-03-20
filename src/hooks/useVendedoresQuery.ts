import { useQuery } from '@tanstack/react-query'
import { Vendedor } from '@/store/useVendedoresStore'

interface FetchVendedoresResponse {
  vendedores: Vendedor[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useVendedoresQuery = (page: number, search: string) => {
  return useQuery<FetchVendedoresResponse>({
    queryKey: ['vendedores', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      })
      const response = await fetch(`/api/supabase/vendedores?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch vendedores')
      }

      const mappedVendedores = (data.vendedores || []).map((v: any) => ({
        codigo: v.OmieId,
        nome: v.Nome,
        email: v.Email,
        comissao: v.Comissao,
        inativo: v.Inativo ? 'S' : 'N'
      }))

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
