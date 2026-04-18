import { useQuery } from '@tanstack/react-query'
import { NfCadastroFlat } from '@/types/nf'
import { mapSupabaseToNfs } from '@/lib/nf-mapper'
import { SortingState } from '@tanstack/react-table'
import { OmieNF } from '@/types/omie-raw'

interface FetchNfsResponse {
  nfs: NfCadastroFlat[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const fetchNfsData = async (
  page: number, 
  search: string, 
  sorting: SortingState = [], 
  filters?: { clienteOmieId?: number }
): Promise<FetchNfsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10',
    search: search,
    sortField: sorting?.[0]?.id || 'data_emissao',
    sortOrder: sorting?.[0]?.desc ? 'desc' : 'asc'
  })
  if (filters?.clienteOmieId) params.append('clienteOmieId', filters.clienteOmieId.toString());

  const response = await fetch(`/api/supabase/nf?${params}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch NFs')
  }

  const rawNfs = (data.nf_resumo_lista || []) as OmieNF[]

  // --- Passive Lookup Population ---
  const { useLookupStore } = await import('@/store/useLookupStore')
  const lookupStore = useLookupStore.getState()
  const clientesMap: Record<number, string> = {}

  rawNfs.forEach((nf) => {
    if (nf.nfDestInt?.nCodCli && nf.nfDestInt?.xNome) {
      clientesMap[nf.nfDestInt.nCodCli] = nf.nfDestInt.xNome
    }
  })
  lookupStore.setClientes(clientesMap)

  const flatNfs = mapSupabaseToNfs(rawNfs);

  return {
    nfs: flatNfs,
    totalPaginas: data.total_de_paginas || 1,
    totalRegistros: data.total_de_registros || 0,
    currentPage: data.pagina || page,
  }
}

export const useNfQuery = (page: number, search: string, sorting: SortingState = [], filters?: { 
  clienteOmieId?: number,
  enabled?: boolean
}) => {
  return useQuery<FetchNfsResponse>({
    queryKey: ['nfs', page, search, sorting, filters],
    enabled: filters?.enabled ?? true,
    queryFn: () => fetchNfsData(page, search, sorting, filters),
    placeholderData: (previousData) => previousData,
  })
}

import { useSuspenseQuery } from '@tanstack/react-query'

export const useSuspenseNfQuery = (page: number, search: string, sorting: SortingState = [], filters?: { 
  clienteOmieId?: number,
}) => {
  return useSuspenseQuery<FetchNfsResponse>({
    queryKey: ['nfs', page, search, sorting, filters],
    queryFn: () => fetchNfsData(page, search, sorting, filters),
  })
}
