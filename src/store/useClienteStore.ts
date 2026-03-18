import { create } from 'zustand';

export interface ClienteCadastro {
  codigo_cliente_omie: number;
  codigo_cliente_integracao: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  telefone1_ddd: string;
  telefone1_numero: string;
  email: string;
  cidade: string;
  estado: string;
  tags: { tag: string }[];
  [key: string]: any;
}

interface ClienteStoreState {
  clientes: ClienteCadastro[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchClientes: (page?: number) => Promise<void>;
}

export const useClienteStore = create<ClienteStoreState>((set, get) => ({
  clientes: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchClientes: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/supabase/clientes?page=${page}&limit=20`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Clientes from Supabase');
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
        tags: [] // Tags are not yet synced to Supabase in this version
      }));

      set({
        clientes: mappedClientes,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
