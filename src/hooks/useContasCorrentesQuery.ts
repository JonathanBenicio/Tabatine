import { useQuery } from '@tanstack/react-query'
import { ContaCorrente } from '@/store/useContasCorrentesStore'

interface FetchContasResponse {
  contas: ContaCorrente[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useContasCorrentesQuery = (page: number, search: string) => {
  return useQuery<FetchContasResponse>({
    queryKey: ['contas-correntes', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      })
      const response = await fetch(`/api/supabase/contas?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Contas Correntes')
      }

      const mappedContas = (data.contas || []).map((c: any) => ({
        nCodCC: c.OmieId,
        descricao: c.Descricao,
        codigo_banco: c.CodigoBanco,
        codigo_agencia: c.CodigoAgencia,
        numero_conta_corrente: c.NumeroContaCorrente,
        tipo: c.Tipo,
        tipo_conta_corrente: c.TipoContaCorrente,
        inativo: c.Inativo ? 'S' : 'N'
      }))

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
