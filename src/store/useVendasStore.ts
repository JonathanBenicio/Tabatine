import { create } from 'zustand';
import { useLookupStore } from './useLookupStore';
import { useNfStore } from './useNfStore';

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
  statusComissao: 'PAGO' | 'PENDENTE' | 'CANCELADA' | string;
  omieData?: any;

  // Cabecalho extra
  dataPedido: string;
  dataPrevisao: string;
  etapa: string;
  qtdItens: number;
  qtdParcelas: number;
  observacao: string;
  observacaoInterna: string;
  observacaoNf: string;
  observacaoNfFisco: string;

  // Informações adicionais
  contato: string;
  dadosAdicionaisNf: string;

  // Produto extra
  codigoProduto: string;
  nIdItem: number;
  ncm: string;
  cfop: string;
  quantidade: number;
  percDesconto: number;
  valorDesconto: number;

  // Impostos
  impostos: {
    icms: ImpostoDetalhe;
    pis: ImpostoDetalhe;
    cofins: ImpostoDetalhe;
    ipi?: ImpostoDetalhe;
    ibs: { valor: number; aliquota: number; base: number; cst: string };
    cbs: { valor: number; aliquota: number; base: number; cst: string };
    valor_iss: number;
    valor_ir: number;
    valor_csll: number;
    valor_inss: number;
  };

  // Frete detalhado
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

  // Info NF / Auditoria
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

  // Totais do pedido
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

  // Todas as parcelas
  todasParcelas: ParcelaInfo[];
}

interface VendasStoreState {
  vendas: VendaPlana[];
  loading: boolean;
  error: string | null;
  hasFetchedInitial: boolean;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  anoSelecionado: number | 'all';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setAnoSelecionado: (ano: number | 'all') => void;
  setCurrentPage: (page: number) => void;
  fetchVendas: (page?: number, forceRefresh?: boolean) => Promise<void>;
}

export const useVendasStore = create<VendasStoreState>((set, get) => ({
  vendas: [],
  loading: false,
  error: null,
  hasFetchedInitial: false,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,
  anoSelecionado: new Date().getFullYear(),
  searchTerm: '',

  setCurrentPage: (page) => set({ currentPage: page }),

  setSearchTerm: (term) => {
    set({ searchTerm: term, totalRegistros: 0, totalPaginas: 1, hasFetchedInitial: false, vendas: [], currentPage: 1 });
    // This will be called via useEffect with debounce in the component
  },

  setAnoSelecionado: (ano) => {
    set({ anoSelecionado: ano, totalRegistros: 0, totalPaginas: 1, hasFetchedInitial: false, vendas: [], currentPage: 1 });
    get().fetchVendas(1, true);
  },

  fetchVendas: async (page = 1, forceRefresh = false) => {
    // Evitar fetch duplicado se já estivermos na mesma página
    if (page === get().currentPage && get().hasFetchedInitial && !forceRefresh) return;

    set({ loading: true, error: null, hasFetchedInitial: true });
    try {
      const lookupStore = useLookupStore.getState();
      
      const targetOmiePage = page;
      const registrosPorPagina = 10;
      const currentYear = get().anoSelecionado;
      const currentSearch = get().searchTerm;

      const response = await fetch(`/api/supabase/vendas?page=${targetOmiePage}&limit=${registrosPorPagina}&year=${currentYear}&search=${encodeURIComponent(currentSearch)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendas from Supabase');
      }

      const rawPedidos = data.pedido_venda_produto || [];

      // --- Passive Lookup Population ---
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

      let pedidosToProcess = rawPedidos;
      // Strict client-side filter: Omie returns by inclusion date, which might bleed old dates.
      if (currentYear !== 'all') {
         pedidosToProcess = rawPedidos.filter((ped: any) => {
           const dateStr = ped.infoCadastro?.dFat || ped.cabecalho?.data_pedido || ped.cabecalho?.data_previsao || '';
            return dateStr.includes(currentYear.toString());
         });
      }

      const flatVendas: VendaPlana[] = [];

      // Flatten each order -> each product
      pedidosToProcess.forEach((ped: any) => {
        const cabecalho = ped.cabecalho || {};
        const det = ped.det || [];
        const frete = ped.frete || {};
        const info = ped.infoCadastro || {};
        const parcelasInfo = ped.lista_parcelas?.parcela || [];

        // Try getting up to 3 installments
        const p1 = parcelasInfo[0] ? { valor: parcelasInfo[0].valor || 0, vencimento: parcelasInfo[0].data_vencimento || '' } : undefined;
        const p2 = parcelasInfo[1] ? { valor: parcelasInfo[1].valor || 0, vencimento: parcelasInfo[1].data_vencimento || '' } : undefined;
        const p3 = parcelasInfo[2] ? { valor: parcelasInfo[2].valor || 0, vencimento: parcelasInfo[2].data_vencimento || '' } : undefined;

        // Map all installments
        const todasParcelas: ParcelaInfo[] = parcelasInfo.map((parc: any, pIdx: number) => ({
          numero: parc.numero_parcela || pIdx + 1,
          valor: parc.valor || 0,
          vencimento: parc.data_vencimento || '',
          percentual: parc.percentual || 0,
          meioPagamento: parc.meio_pagamento || '',
          categoria: parc.categoria || '',
          nsu: parc.nsu || '',
        }));

        const infoAdicional = ped.informacoes_adicionais || {};
        const totalPedido = ped.total_pedido || {};
        const observacoes = ped.observacoes || {};

        det.forEach((item: any, idx: number) => {
          const prod = item.produto || {};
          const itemIde = item.ide || {};
          const imp = item.imposto || {};
          const icms = imp.icms || {};
          const pis = imp.pis_padrao || {};
          const cofins = imp.cofins_padrao || {};
          const ibs = imp.ibs || {};
          const cbs = imp.cbs || {};

            // Auditoria helper
            const formatISO = (iso: string) => {
              if (!iso || iso === '--') return { d: '--', h: '--' };
              try {
                const dt = new Date(iso);
                if (isNaN(dt.getTime())) return { d: iso, h: '--' };
                return {
                  d: dt.toLocaleDateString('pt-BR'),
                  h: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
              } catch {
                return { d: iso, h: '--' };
              }
            };

            const incInfo = formatISO(info.dInc);
            const altInfo = formatISO(info.dAlt);

            flatVendas.push({
              id_linha: `${cabecalho.codigo_pedido}-${idx}`,
              data: info.dFat || cabecalho.data_pedido || cabecalho.data_previsao || '--',
              cliente: cabecalho.codigo_cliente?.toString() || '--',
              vendedor: infoAdicional.codVend?.toString() || '--',
              codVendedor: infoAdicional.codVend || 0,
              codProjeto: infoAdicional.codProj || 0,
              pedido: cabecalho.numero_pedido || '',
              numeroPedido: cabecalho.numero_pedido || '',
              nf: info.numero_nfe || '', 
              produto: prod.descricao || 'Produto sem nome',
              und: prod.unidade || 'UN',
              valorVenda: prod.valor_unitario || 0,
              condPagto: cabecalho.codigo_parcela || '',
              frete: frete.valor_frete || 0,
              percComissao: infoAdicional.perc_comissao || 0,
              valorTotal: prod.valor_total || 0,
              formaPg: cabecalho.meio_pagamento || '',
              banco: infoAdicional.conta_corrente_nome || infoAdicional.codigo_conta_corrente?.toString() || '',
              codContaCorrente: infoAdicional.codigo_conta_corrente || 0,
              parcela1: p1,
              parcela2: p2,
              parcela3: p3,
              vencimentoStatus: cabecalho.etapa || 'Pendente',
              statusComissao: 'PENDENTE',
              omieData: ped,

              // Cabecalho extra
              dataPedido: cabecalho.data_pedido || '--',
              dataPrevisao: cabecalho.data_previsao || '--',
              etapa: cabecalho.etapa || '--',
              qtdItens: det.length,
              qtdParcelas: cabecalho.qtde_parcelas || 0,
              observacao: observacoes.obs_venda || '',
              observacaoInterna: observacoes.obs_interna || '',
              observacaoNf: observacoes.obs_nf || '',
              observacaoNfFisco: observacoes.obs_nf_fisco || '',

              // Informações adicionais
              contato: infoAdicional.contato || '',
              dadosAdicionaisNf: infoAdicional.observacoes?.obs_venda || '',

              // Produto extra
              codigoProduto: prod.codigo || '',
              nIdItem: itemIde.codigo_item || 0,
              ncm: prod.ncm || '--',
              cfop: prod.cfop || '--',
              quantidade: prod.quantidade || 0,
              percDesconto: prod.percentual_desconto || 0,
              valorDesconto: prod.valor_desconto || 0,

              // Impostos
              impostos: {
                icms: {
                  aliquota: icms.aliquota ?? icms.pICMS ?? icms.aliq_icms ?? 0,
                  base: icms.base_calculo ?? icms.vBC ?? icms.base_icms ?? 0,
                  valor: icms.valor_icms ?? icms.vICMS ?? 0,
                  cst: icms.cst ?? icms.CST ?? icms.cst_icms ?? '--',
                },
                pis: {
                  aliquota: pis.aliquota ?? pis.pPIS ?? pis.aliq_pis ?? 0,
                  base: pis.base_calculo ?? pis.vBC ?? pis.base_pis ?? 0,
                  valor: pis.valor_pis ?? pis.vPIS ?? 0,
                  cst: pis.cst ?? pis.CST ?? pis.cod_sit_trib_pis ?? '--',
                },
                cofins: {
                  aliquota: cofins.aliquota ?? cofins.pCOFINS ?? cofins.aliq_cofins ?? 0,
                  base: cofins.base_calculo ?? cofins.vBC ?? cofins.base_cofins ?? 0,
                  valor: cofins.valor_cofins ?? cofins.vCOFINS ?? 0,
                  cst: cofins.cst ?? cofins.CST ?? cofins.cod_sit_trib_cofins ?? '--',
                },
                ipi: {
                  aliquota: imp.ipi?.aliquota ?? imp.ipi?.pIPI ?? imp.ipi?.aliq_ipi ?? 0,
                  base: imp.ipi?.base_calculo ?? imp.ipi?.vBC ?? imp.ipi?.base_ipi ?? 0,
                  valor: imp.ipi?.valor_ipi ?? imp.ipi?.vIPI ?? 0,
                  cst: imp.ipi?.cst ?? imp.ipi?.CST ?? imp.ipi?.cst_ipi ?? '--',
                },
                ibs: {
                  valor: ibs.valor_ibs ?? 0,
                  aliquota: ibs.aliquota_ibs_uf ?? 0,
                  base: ibs.base_ibs_cbs ?? 0,
                  cst: '--',
                },
                cbs: {
                  valor: cbs.valor_cbs ?? 0,
                  aliquota: cbs.aliquota_cbs ?? 0,
                  base: cbs.base_ibs_cbs ?? 0,
                  cst: '--',
                },
                valor_iss: totalPedido.valor_iss ?? 0,
                valor_ir: totalPedido.valor_ir ?? 0,
                valor_csll: totalPedido.valor_csll ?? 0,
                valor_inss: totalPedido.valor_inss ?? 0,
              },

              // Frete detalhado
              freteDetalhado: {
                modalidade: frete.modalidade || '--',
                valor: frete.valor_frete || 0,
                pesoBruto: frete.peso_bruto || 0,
                pesoLiq: frete.peso_liquido || 0,
                qtdVolumes: frete.quantidade_volumes || 0,
                previsaoEntrega: frete.previsao_entrega || '--',
                transportadora: frete.codigo_transportadora?.toString() || '--',
                codTransportadora: frete.codigo_transportadora || 0,
              },

              // Info NF / Auditoria
              dataFaturamento: info.dFat || '--',
              dataInclusao: incInfo.d,
              horaInclusao: incInfo.h,
              dataAlteracao: altInfo.d,
              horaAlteracao: altInfo.h,
              usuarioInclusao: info.uInc || '',
              usuarioAlteracao: info.uAlt || '',
              chaveNfe: info.chave_nfe || '',
              statusNfe: info.cancelado === 'S' ? 'CANCELADA' : info.denegado === 'S' ? 'DENEGADA' : info.autorizado === 'S' ? 'AUTORIZADA' : info.numero_nfe ? 'EMITIDA' : 'PENDENTE',
              serieNfe: info.serie_nfe || '',
              valorTotalNfe: info.valor_total_nfe || 0,
              cancelado: info.cancelado || 'N',
              denegado: info.denegado || 'N',
              autorizado: info.autorizado || 'N',

              // Totais do pedido
              totalPedido: {
                valorTotal: totalPedido.valor_total_pedido ?? 0,
                baseIcms: totalPedido.base_calculo_icms ?? 0,
                valorIcms: totalPedido.valor_icms ?? 0,
                valorMercadorias: totalPedido.valor_mercadorias ?? 0,
                valorIpi: totalPedido.valor_IPI ?? 0,
                valorPis: totalPedido.valor_pis ?? 0,
                valorCofins: totalPedido.valor_cofins ?? 0,
                valorIss: totalPedido.valor_iss ?? 0,
                valorIr: totalPedido.valor_ir ?? 0,
                valorCsll: totalPedido.valor_csll ?? 0,
                valorInss: totalPedido.valor_inss ?? 0,
              },

            // Todas as parcelas
            todasParcelas,
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
      const errorMessage = error.message || '';
      if (errorMessage.includes('consumo indevido') || errorMessage.includes('425') || errorMessage.includes('bloqueada')) {
        set({ 
          error: ' limite de requisições da Omie atingido. A API bloqueou temporariamente novas consultas por segurança. Mínimo de 1 minuto de aguardo.',
          loading: false 
        });
      } else {
        set({ error: errorMessage, loading: false });
      }
    }
  },
}));
