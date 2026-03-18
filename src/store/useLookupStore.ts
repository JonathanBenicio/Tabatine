import { create } from 'zustand';

interface LookupStoreState {
  clientes: Record<number, string>;
  vendedores: Record<number, string>;
  contas: Record<number, string>;
  
  // Setters para alimentação passiva pelas APIs de listagem
  setClientes: (map: Record<number, string>) => void;
  setVendedores: (map: Record<number, string>) => void;
  setContas: (map: Record<number, string>) => void;
  
  getClienteNome: (id: number | string) => string;
  getVendedorNome: (id: number | string) => string;
  getContaNome: (id: number | string) => string;
}

export const useLookupStore = create<LookupStoreState>((set, get) => ({
  clientes: {},
  vendedores: {},
  contas: {},

  setClientes: (map) => {
    set((state) => ({ clientes: { ...state.clientes, ...map } }));
  },

  setVendedores: (map) => {
    set((state) => ({ vendedores: { ...state.vendedores, ...map } }));
  },

  setContas: (map) => {
    set((state) => ({ contas: { ...state.contas, ...map } }));
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
