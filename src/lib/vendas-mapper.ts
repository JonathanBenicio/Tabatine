import { VendaPlana, ParcelaInfo, ImpostoDetalhe } from '@/store/useVendasStore';

/**
 * Maps a date string to a PT-BR formatted date and time.
 */
export const formatISOToBR = (iso: string) => {
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

/**
 * Maps a raw Omie/Supabase order record to the VendaPlana interface.
 * This function centralizes the flattening logic used across the application.
 */
export function mapOrderToFlatVendas(ped: any): VendaPlana[] {
  const cabecalho = ped.cabecalho || {};
  const det = ped.det || [];
  const frete = ped.frete || {};
  const info = ped.infoCadastro || {};
  const parcelasInfo = ped.lista_parcelas?.parcela || [];
  const infoAdicional = ped.informacoes_adicionais || {};
  const totalPedido = ped.total_pedido || {};
  const observacoes = ped.observacoes || {};

  // Try getting up to 3 installments for the summary
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

  const flatRows: VendaPlana[] = [];

  // Aux function for overdue check
  const parseAnyDate = (str: string) => {
    if (!str || str === '--') return null;
    if (str.includes('/')) {
      const [d, m, y] = str.split('/').map(Number);
      return new Date(y, m - 1, d);
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  det.forEach((item: any, idx: number) => {
    const prod = item.produto || {};
    const itemIde = item.ide || {};
    const imp = item.imposto || {};
    const icms = imp.icms || {};
    const pis = imp.pis_padrao || {};
    const cofins = imp.cofins_padrao || {};
    const ibs = imp.ibs || {};
    const cbs = imp.cbs || {};

    const incInfo = formatISOToBR(info.dInc);
    const altInfo = formatISOToBR(info.dAlt);

    // Smart Status Logic
    const isFaturado = cabecalho.etapa === '90';
    const firstDue = parcelasInfo[0] ? parseAnyDate(parcelasInfo[0].data_vencimento) : null;
    const isOverdue = !isFaturado && firstDue && firstDue < today;

    const vencimentoStatus = isFaturado ? 'Faturado' : (isOverdue ? 'Atrasado' : (cabecalho.etapa || 'Pendente'));
    
    // COMMISSION STATUS: If NF is authorized, it's 'DISPONIVEL', else 'PENDENTE'
    // This is a heuristic until real commission logic is implemented.
    const statusComissao = info.autorizado === 'S' ? 'DISPONIVEL' : 'PENDENTE';

    flatRows.push({
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
      vencimentoStatus,
      statusComissao,
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

  return flatRows;
}
