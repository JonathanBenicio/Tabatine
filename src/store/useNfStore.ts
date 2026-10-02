import { create } from 'zustand'
import { mapSupabaseToNfs, mapSupabaseToNf } from '@/lib/nf-mapper'
import { NfCadastroFlat } from '@/types/nf'
import { OmieNFSummary } from '@/types/omie-raw'
import { SortingState, Updater } from '@tanstack/react-table'

interface NfStoreState {
  nfs: NfCadastroFlat[]
  nfsMap: Record<string, NfCadastroFlat>
  loading: boolean
  error: string | null
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  sorting: SortingState
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  setSorting: (updater: Updater<SortingState>) => void
  fetchNfs: (page?: number, search?: string) => Promise<void>
  fetchNFById: (id: number) => Promise<NfCadastroFlat | null>
}

// ── Dedup Helper ──────────────────────────────────────────
const fetchingPromises = new Map<number, Promise<NfCadastroFlat | null>>();

export const useNfStore = create<NfStoreState>((set, get) => ({
  nfs: [],
  nfsMap: {},
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  sorting: [{ id: 'data_emissao', desc: true }],
  setSearchTerm: (term: string) => set({ searchTerm: term, currentPage: 1 }),
  setCurrentPage: (page: number) => set({ currentPage: page }),
  setSorting: (updaterOrValue: Updater<SortingState>) => {
    const nextState = typeof updaterOrValue === 'function' 
      ? updaterOrValue(get().sorting) 
      : updaterOrValue;
    set({ sorting: nextState, currentPage: 1 });
  },

  fetchNfs: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: currentSearch
      })
      const response = await fetch(`/api/supabase/nf?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch NFs from Supabase')
      }

      const rawNfs = data.nf_resumo_lista || []

      // --- Passive Lookup Population ---
      const { useLookupStore } = await import('./useLookupStore')
      const lookupStore = useLookupStore.getState()
      const clientesMap: Record<number, string> = {}

      rawNfs.forEach((nf: OmieNFSummary) => {
        if (nf.nfDestInt?.nCodCli && nf.nfDestInt?.xNome) {
          clientesMap[nf.nfDestInt.nCodCli] = nf.nfDestInt.xNome
        }
      })
      lookupStore.setClientes(clientesMap)

      const flatNfs = mapSupabaseToNfs(rawNfs);

      const nfsMap = flatNfs.reduce((acc: Record<string, NfCadastroFlat>, nf: NfCadastroFlat) => {
        acc[nf.id_nf.toString()] = nf
        return acc
      }, {} as Record<string, NfCadastroFlat>)

      set({
        nfs: flatNfs,
        nfsMap,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      })
    } catch (error: unknown) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchNFById: async (id: number) => {
    // 1. Check cache
    const existing = get().nfsMap[id.toString()]
    if (existing) return existing

    // 2. Check if already fetching
    if (fetchingPromises.has(id)) {
      return fetchingPromises.get(id)!;
    }

    set({ loading: true, error: null })
    
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/supabase/nf?id=${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch NF by ID')
        }

        const rawNf = data.nf_resumo_lista?.[0]
        if (!rawNf) return null

        // (We reuse the mapNf internal logic indirectly or just duplicate mapping here as before)
        const mapped = mapSupabaseToNf(rawNf);

        set(state => ({
          nfsMap: { ...state.nfsMap, [id.toString()]: mapped },
          nfs: [...state.nfs.filter(nf => nf.id_nf !== mapped.id_nf), mapped],
          loading: false
        }))
        return mapped
      } catch (error: unknown) {
        set({ error: (error as Error).message, loading: false })
        return null
      } finally {
        fetchingPromises.delete(id);
      }
    })();

    fetchingPromises.set(id, fetchPromise);
    return fetchPromise;
  },
}))
