import { create } from 'zustand'

export interface ClienteCadastro {
  codigo_cliente_omie: number
  codigo_cliente_integracao: string
  razao_social: string
  nome_fantasia: string
  cnpj_cpf: string
  telefone1_ddd: string
  telefone1_numero: string
  email: string
  cidade: string
  estado: string
  bairro?: string
  endereco?: string
  endereco_numero?: string
  endereco_complemento?: string
  inscricao_estadual?: string
  inscricao_municipal?: string
  optante_simples_nacional?: boolean
  tags: { tag: string }[]
  [key: string]: any
}

interface ClienteStoreState {
  clientes: ClienteCadastro[]
  loading: boolean
  error: string | null
  totalPaginas: number
  totalRegistros: number
  currentPage: number
  searchTerm: string
  setSearchTerm: (term: string) => void
  setCurrentPage: (page: number) => void
  fetchClientes: (page?: number, search?: string) => Promise<void>
}

export const useClienteStore = create<ClienteStoreState>((set, get) => ({
  clientes: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  searchTerm: '',
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchClientes: async (page = 1, search) => {
    const currentSearch = search !== undefined ? search : get().searchTerm
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: currentSearch
      })
      const response = await fetch(`/api/supabase/clientes?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Clientes from Supabase')
      }

      const mappedClientes = (data.clientes || []).map((c: any) => ({
        codigo_cliente_omie: c.OmieId,
        razao_social: c.RazaoSocial,
        nome_fantasia: c.NomeFantasia,
        cnpj_cpf: c.CnpjCpf,
        telefone1_ddd: c.TelefoneDdd,
        telefone1_numero: c.TelefoneNumero,
        email: c.Email,
        cidade: c.Cidade,
        estado: c.Estado,
        bairro: c.Bairro,
        endereco: c.Endereco,
        endereco_numero: c.EnderecoNumero,
        endereco_complemento: c.EnderecoComplemento,
        inscricao_estadual: c.InscricaoEstadual,
        inscricao_municipal: c.InscricaoMunicipal,
        optante_simples_nacional: c.OptanteSimplesNacional,
        tags: [] // Tags are not yet synced to Supabase in this version
      }))

      set({
        clientes: mappedClientes,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },
}))
