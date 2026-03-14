import { create } from 'zustand';

export interface VendaPlana {
  id_linha: string;
  data: string;
  cliente: string;
  vendedor: string;
  pedido: string;
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
  parcela1?: { valor: number; vencimento: string };
  parcela2?: { valor: number; vencimento: string };
  parcela3?: { valor: number; vencimento: string };
  vencimentoStatus: string;
  statusComissao: 'PAGO' | 'PENDENTE' | 'CANCELADA' | string;
}

interface VendasStoreState {
  vendas: VendaPlana[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchVendas: (page?: number) => Promise<void>;
}

export const useVendasStore = create<VendasStoreState>((set, get) => ({
  vendas: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchVendas: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/omie/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarPedidos',
          param: [{ pagina: page, registros_por_pagina: 10 }]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendas');
      }

      const rawPedidos = data.pedido_venda_produto || [];
      const flatVendas: VendaPlana[] = [];

      // Flatten each order -> each product
      rawPedidos.forEach((ped: any) => {
        const cabecalho = ped.cabecalho || {};
        const det = ped.det || [];
        const frete = ped.frete || {};
        const info = ped.infoCadastro || {};
        const parcelasInfo = ped.lista_parcelas?.parcela || [];

        // Try getting up to 3 installments
        const p1 = parcelasInfo[0] ? { valor: parcelasInfo[0].valor || 0, vencimento: parcelasInfo[0].data_vencimento || '' } : undefined;
        const p2 = parcelasInfo[1] ? { valor: parcelasInfo[1].valor || 0, vencimento: parcelasInfo[1].data_vencimento || '' } : undefined;
        const p3 = parcelasInfo[2] ? { valor: parcelasInfo[2].valor || 0, vencimento: parcelasInfo[2].data_vencimento || '' } : undefined;

        det.forEach((item: any, idx: number) => {
          const prod = item.produto || {};
          flatVendas.push({
            id_linha: `${cabecalho.numero_pedido}-${idx}`,
            data: cabecalho.data_previsao || cabecalho.data_pedido || '--',
            cliente: cabecalho.codigo_cliente?.toString() || '--', // Might be ID, requires Client API join later ideally
            vendedor: cabecalho.codigo_vendedor?.toString() || '--',
            pedido: cabecalho.numero_pedido || '',
            nf: info.numero_nfe || '', 
            produto: prod.descricao || prod.xProd || 'Produto sem nome',
            und: prod.unidade || prod.uCom || 'UN',
            valorVenda: prod.valor_unitario || prod.vUnCom || 0,
            condPagto: cabecalho.codigo_parcela || '--',
            frete: frete.valor_frete || 0,
            percComissao: prod.perc_desconto || 0, // Fallback if no commision
            valorTotal: prod.valor_mercadoria || prod.vProd || 0,
            formaPg: cabecalho.forma_pagamento || '--',
            banco: cabecalho.conta_corrente || '--',
            parcela1: p1,
            parcela2: p2,
            parcela3: p3,
            vencimentoStatus: cabecalho.etapa || 'Pendente',
            statusComissao: 'PENDENTE'
          });
        });
      });

      set({
        vendas: flatVendas,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0, // In this case records are Orders, not Flat Rows
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
