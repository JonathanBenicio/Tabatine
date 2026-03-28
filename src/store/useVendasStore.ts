import { create } from 'zustand';
import { useLookupStore } from '@/store/useLookupStore';
import { mapOrderToFlatVendas } from '@/lib/vendas-mapper';
import { SortingState, ColumnFiltersState, VisibilityState, ColumnPinningState } from '@tanstack/react-table';

export interface ParcelaInfo {
  numero: number;
  valor: number;
  vencimento: string;
  percentual: number;
  meioPagamento: string;
  categoria: string;
  nsu: string;
}

export interface ImpostoDetalhe {
  aliquota: number;
  base: number;
  valor: number;
  cst: string;
}

export interface VendaPlana {
  id_linha: string; 
  data: string;
  cliente: string;
  vendedor: string;
  codVendedor: number;
  codProjeto: number;
  pedido: string;
  numeroPedido: string;
  nf: string;
  produto: string;
  und: string;
  valorVenda: number;
  condPagto: string;
  frete: number;
  percComissao: number;
  valorTotal: number;
  formaPg: string;
  banco: string;
  codContaCorrente: number;
  parcela1?: { valor: number; vencimento: string };
  parcela2?: { valor: number; vencimento: string };
  parcela3?: { valor: number; vencimento: string };
  vencimentoStatus: string;
  statusComissao: string;
  omieData: any;

  dataPedido: string;
  dataPrevisao: string;
  etapa: string;
  qtdItens: number;
  qtdParcelas: number;
  observacao: string;
  observacaoInterna: string;
  observacaoNf: string;
  observacaoNfFisco: string;

  contato: string;
  dadosAdicionaisNf: string;

  codigoProduto: string; 
  nIdItem: number;
  ncm: string;
  cfop: string;
  quantidade: number;
  percDesconto: number;
  valorDesconto: number;

  impostos: {
    icms: ImpostoDetalhe;
    pis: ImpostoDetalhe;
    cofins: ImpostoDetalhe;
    ipi: ImpostoDetalhe;
    ibs: { valor: number; aliquota: number; base: number; cst: string };
    cbs: { valor: number; aliquota: number; base: number; cst: string };
    valor_iss: number;
    valor_ir: number;
    valor_csll: number;
    valor_inss: number;
  };

  freteDetalhado: {
    modalidade: string;
    valor: number;
    pesoBruto: number;
    pesoLiq: number;
    qtdVolumes: number;
    previsaoEntrega: string;
    transportadora: string;
    codTransportadora: number;
  };

  dataFaturamento: string;
  dataInclusao: string;
  horaInclusao: string;
  dataAlteracao: string;
  horaAlteracao: string;
  usuarioInclusao: string;
  usuarioAlteracao: string;
  chaveNfe: string;
  statusNfe: string; 
  serieNfe: string;
  valorTotalNfe: number;
  cancelado: string;
  denegado: string;
  autorizado: string;

  totalPedido: {
    valorTotal: number;
    baseIcms: number;
    valorIcms: number;
    valorMercadorias: number;
    valorIpi: number;
    valorPis: number;
    valorCofins: number;
    valorIss: number;
    valorIr: number;
    valorCsll: number;
    valorInss: number;
  };

  todasParcelas: ParcelaInfo[];
}

export interface VendasFilters {
  startDate?: string;
  endDate?: string;
  clienteOmieId?: number;
  vendedorOmieId?: number;
  contaCorrenteId?: number;
}

interface VendasStoreState {
  vendas: VendaPlana[];
  loading: boolean;
  error: string | null;
  hasFetchedInitial: boolean;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  filters: VendasFilters;
  
  setCurrentPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
  setPageSize: (size: number) => void;
  setSorting: (sorting: SortingState) => void;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setColumnPinning: (pinning: ColumnPinningState) => void;
  setFilters: (filters: VendasFilters) => void;
  
  showColumnFilters: boolean;
  setShowColumnFilters: (show: boolean) => void;
  
  resetFilters: () => void;
  fetchVendas: (page?: number, forceRefresh?: boolean) => Promise<void>;
  fetchVendaByLinhaId: (id_linha: string) => Promise<VendaPlana | null>;
}

const fetchingPromises = new Map<string, Promise<VendaPlana | null>>();

export const useVendasStore = create<VendasStoreState>((set, get) => ({
  vendas: [],
  loading: false,
  error: null,
  hasFetchedInitial: false,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  sorting: [{ id: 'data', desc: true }],
  columnFilters: [],
  columnVisibility: {},
  columnPinning: { left: ['cliente'], right: ['actions'] },
  filters: {},

  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
  setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
  setSorting: (sorting) => set({ sorting, currentPage: 1 }),
  setColumnFilters: (columnFilters) => set({ columnFilters, currentPage: 1 }),
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  setColumnPinning: (columnPinning) => set({ columnPinning }),
  setFilters: (filters) => set({ filters, currentPage: 1 }),
  showColumnFilters: false,
  setShowColumnFilters: (show) => set({ showColumnFilters: show }),
  resetFilters: () => set({
    filters: {},
    currentPage: 1,
    searchTerm: '',
    columnFilters: [],
    sorting: [{ id: 'data', desc: true }],
  }),

  fetchVendas: async (page = 1, forceRefresh = false) => {
    if (page === get().currentPage && get().hasFetchedInitial && !forceRefresh) return;
    set({ loading: true, error: null, hasFetchedInitial: true });
    try {
      const { searchTerm, sorting, filters } = get();
      const sortField = sorting[0]?.id || 'data';
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        sortField,
        sortOrder,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.clienteOmieId && { clienteOmieId: filters.clienteOmieId.toString() }),
        ...(filters.vendedorOmieId && { vendedorOmieId: filters.vendedorOmieId.toString() }),
        ...(filters.contaCorrenteId && { contaCorrenteId: filters.contaCorrenteId.toString() }),
      });

      const response = await fetch(`/api/supabase/vendas?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch Vendas');

      const rawPedidos = data.pedido_venda_produto || [];
      const lookupStore = useLookupStore.getState();
      const clientesMap: Record<number, string> = {};
      const vendedoresMap: Record<number, string> = {};
      const contasMap: Record<number, string> = {};

      rawPedidos.forEach((ped: any) => {
        if (ped.cabecalho?.codigo_cliente && ped.infoCadastro?.cliente_nome) {
          clientesMap[ped.cabecalho.codigo_cliente] = ped.infoCadastro.cliente_nome;
        }
        if (ped.informacoes_adicionais?.codVend && ped.informacoes_adicionais?.vendedor_nome) {
          vendedoresMap[ped.informacoes_adicionais.codVend] = ped.informacoes_adicionais.vendedor_nome;
        }
        if (ped.informacoes_adicionais?.codigo_conta_corrente && ped.informacoes_adicionais?.conta_corrente_nome) {
          contasMap[ped.informacoes_adicionais.codigo_conta_corrente] = ped.informacoes_adicionais.conta_corrente_nome;
        }
      });
      lookupStore.setClientes(clientesMap);
      lookupStore.setVendedores(vendedoresMap);
      lookupStore.setContas(contasMap);

      const flatVendas: VendaPlana[] = [];
      rawPedidos.forEach((ped: any) => flatVendas.push(...mapOrderToFlatVendas(ped)));

      set({
        vendas: flatVendas,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchVendaByLinhaId: async (id_linha: string) => {
    const existing = get().vendas.find(v => v.id_linha === id_linha);
    if (existing) return existing;
    if (fetchingPromises.has(id_linha)) return fetchingPromises.get(id_linha)!;

    const omieId = id_linha.split('-')[0];
    if (!omieId) return null;
    set({ loading: true, error: null });
    
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`/api/supabase/vendas?omieId=${omieId}`);
        const data = await response.json();
        const rawPedido = data.pedido_venda_produto?.[0];
        if (!rawPedido) return null;
        const flatResults = mapOrderToFlatVendas(rawPedido);
        const venda = flatResults.find(v => v.id_linha === id_linha) || flatResults[0];
        set(state => ({ 
          vendas: [...state.vendas.filter(v => v.id_linha !== id_linha), venda],
          loading: false 
        }));
        return venda;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        return null;
      } finally {
        fetchingPromises.delete(id_linha);
      }
    })();
    fetchingPromises.set(id_linha, fetchPromise);
    return fetchPromise;
  },
}));
