import { create } from 'zustand';

interface LookupStoreState {
  clientes: Record<number, string>;
  vendedores: Record<number, string>;
  contas: Record<number, string>;
  
  loading: boolean;
  
  setClientesLookup: (map: Record<number, string>) => void;
  fetchCliente: (id: number) => Promise<void>;
  fetchVendedor: (id: number) => Promise<void>;
  fetchConta: (id: number) => Promise<void>;
  
  getClienteNome: (id: number | string) => string;
  getVendedorNome: (id: number | string) => string;
  getContaNome: (id: number | string) => string;
}

export const useLookupStore = create<LookupStoreState>((set, get) => ({
  clientes: {},
  vendedores: {},
  contas: {},
  loading: false,

  setClientesLookup: (map) => {
    set((state) => ({ clientes: { ...state.clientes, ...map } }));
  },

  fetchCliente: async (id: number) => {
    if (!id || get().clientes[id]) return;
    try {
      const res = await fetch('/api/omie/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ConsultarCliente',
          param: [{ codigo_cliente_omie: id }]
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.nome_fantasia || data.razao_social) {
        set((state) => ({ clientes: { ...state.clientes, [id]: data.nome_fantasia || data.razao_social } }));
      }
    } catch (e) {
      console.error('Failed to fetch cliente', id, e);
    }
  },

  fetchVendedor: async (id: number) => {
    if (!id || get().vendedores[id]) return;
    try {
      const res = await fetch('/api/omie/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ConsultarVendedor',
          param: [{ codigo: id }] // Or codigo_vendedor depending on API, assuming it works as 'codigo' if looking up by id
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.nome) {
        set((state) => ({ vendedores: { ...state.vendedores, [id]: data.nome } }));
      }
    } catch (e) {
      console.error('Failed to fetch vendedor', id, e);
    }
  },

  fetchConta: async (id: number) => {
    if (!id || get().contas[id]) return;
    try {
      const res = await fetch('/api/omie/contas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ConsultarContaCorrente',
          param: [{ nCodCC: id }]
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.descricao || data.sDescricao) {
        set((state) => ({ contas: { ...state.contas, [id]: data.descricao || data.sDescricao } }));
      }
    } catch (e) {
      console.error('Failed to fetch conta', id, e);
    }
  },

  getClienteNome: (id) => {
    const numId = Number(id);
    return get().clientes[numId] || id?.toString() || '--';
  },

  getVendedorNome: (id) => {
    const numId = Number(id);
    return get().vendedores[numId] || id?.toString() || '--';
  },

  getContaNome: (id) => {
    const numId = Number(id);
    return get().contas[numId] || id?.toString() || '--';
  }
}));
