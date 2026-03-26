import { useQuery } from '@tanstack/react-query';
import { useVendasStore, VendaPlana, ParcelaInfo, VendasFilters } from '@/store/useVendasStore';
import { useLookupStore } from '@/store/useLookupStore';
import { SortingState } from '@tanstack/react-table';

interface FetchVendasResponse {
  vendas: VendaPlana[];
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
}

export const useVendasQuery = (
  page: number, 
  search: string, 
  sorting: SortingState,
  filters: VendasFilters,
  enabled: boolean = true
) => {
  return useQuery<FetchVendasResponse>({
    queryKey: ['vendas', page, search, sorting, filters],
    enabled,
    queryFn: async () => {
      const sortField = sorting[0]?.id || 'data';
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendas');
      }

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

      const pedidosToProcess = rawPedidos;

      const flatVendas: VendaPlana[] = [];
      pedidosToProcess.forEach((ped: any) => {
        const cabecalho = ped.cabecalho || {};
        const det = ped.det || [];
        const frete = ped.frete || {};
        const info = ped.infoCadastro || {};
        const parcelasInfo = ped.lista_parcelas?.parcela || [];

        const p1 = parcelasInfo[0] ? { valor: parcelasInfo[0].valor || 0, vencimento: parcelasInfo[0].data_vencimento || '' } : undefined;
        const p2 = parcelasInfo[1] ? { valor: parcelasInfo[1].valor || 0, vencimento: parcelasInfo[1].data_vencimento || '' } : undefined;
        const p3 = parcelasInfo[2] ? { valor: parcelasInfo[2].valor || 0, vencimento: parcelasInfo[2].data_vencimento || '' } : undefined;

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
            codProjeto: 0,
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
            dataPedido: cabecalho.data_pedido || '--',
            dataPrevisao: cabecalho.data_previsao || '--',
            etapa: cabecalho.etapa || '--',
            qtdItens: det.length,
            qtdParcelas: cabecalho.qtde_parcelas || 0,
            observacao: observacoes.obs_venda || '',
            observacaoInterna: observacoes.obs_interna || '',
            observacaoNf: observacoes.obs_nf || '',
            observacaoNfFisco: observacoes.obs_nf_fisco || '',
            contato: infoAdicional.contato || '',
            dadosAdicionaisNf: infoAdicional.observacoes?.obs_venda || '',
            codigoProduto: prod.codigo || '',
            nIdItem: itemIde.codigo_item || 0,
            ncm: prod.ncm || '--',
            cfop: prod.cfop || '--',
            quantidade: prod.quantidade || 0,
            percDesconto: prod.percentual_desconto || 0,
            valorDesconto: prod.valor_desconto || 0,
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
            todasParcelas,
          });
        });
      });

      return {
        vendas: flatVendas,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      };
    },
    placeholderData: (previousData) => previousData,
  });
};
