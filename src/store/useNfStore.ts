import { create } from 'zustand'
import { mapSupabaseToNfs, mapSupabaseToNf } from '@/lib/nf-mapper'

export interface NfCadastroFlat {
  id_nf: number
  numero_nf: string
  serie: string
  modelo: string
  data_emissao: string
  hora_emissao: string
  data_registro: string
  data_saida_entrada: string
  hora_saida_entrada: string
  status_nf: string
  tipo_nf: string
  finalidade_nfe: string
  tipo_ambiente: string
  indicador_pagamento: string
  denegado: string
  data_cancelamento: string
  data_inutilizacao: string
  razao_social: string
  cnpj_cpf: string
  cod_cliente: number
  cod_empresa: number
  valor_total_nf: number
  valor_produtos: number
  valor_icms: number
  valor_bc_icms: number
  valor_ipi: number
  valor_pis: number
  valor_cofins: number
  valor_frete: number
  valor_seguro: number
  valor_desconto: number
  valor_outras: number
  valor_total_tributos: number
  valor_bc_st: number
  valor_st: number
  valor_icms_desonerado: number
  valor_ii: number
  valor_servicos: number
  valor_iss: number
  natureza_operacao: string
  chave_nfe: string
  cod_categoria: string
  modalidade_frete: string
  id_pedido: number
  id_recebimento: number
  id_transportador: number
  importado_api: string
  data_alteracao: string
  hora_alteracao: string
  data_inclusao: string
  hora_inclusao: string
  usuario_alteracao: string
  usuario_inclusao: string
  itens: any[]
  titulos: any[]
  omieData?: any
  [key: string]: any
}

interface NfStoreState {
  nfs: NfCadastroFlat[]
  nfsMap: Record<string, NfCadastroFlat>
  loading: boolean
  error: string | null
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
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
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

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

      rawNfs.forEach((nf: any) => {
        if (nf.nfDestInt?.nCodCli && nf.nfDestInt?.xNome) {
          clientesMap[nf.nfDestInt.nCodCli] = nf.nfDestInt.xNome
        }
      })
      lookupStore.setClientes(clientesMap)

      const flatNfs = mapSupabaseToNfs(rawNfs);

      const nfsMap = flatNfs.reduce((acc: any, nf: any) => {
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
    } catch (error: any) {
      set({ error: error.message, loading: false })
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
      } catch (error: any) {
        set({ error: error.message, loading: false })
        return null
      } finally {
        fetchingPromises.delete(id);
      }
    })();

    fetchingPromises.set(id, fetchPromise);
    return fetchPromise;
  },
}))
