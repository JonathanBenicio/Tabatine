import { NfCadastroFlat } from '@/store/useNfStore';

/**
 * Maps a raw Supabase/Omie NF record to the NfCadastroFlat interface.
 * This function centralizes the complex extraction of taxes, items, and headers.
 */
export function mapSupabaseToNf(nf: any): NfCadastroFlat {
  if (!nf) {
    return {
      id_nf: 0,
      numero_nf: '---',
      serie: '---',
      modelo: '---',
      data_emissao: '',
      hora_emissao: '',
      data_registro: '',
      data_saida_entrada: '',
      hora_saida_entrada: '',
      status_nf: 'Pendente',
      tipo_nf: '',
      finalidade_nfe: '',
      tipo_ambiente: '',
      indicador_pagamento: '',
      denegado: 'N',
      data_cancelamento: '',
      data_inutilizacao: '',
      razao_social: 'Desconhecido',
      cnpj_cpf: '---',
      cod_cliente: 0,
      cod_empresa: 0,
      valor_total_nf: 0,
      valor_produtos: 0,
      valor_icms: 0,
      valor_bc_icms: 0,
      valor_ipi: 0,
      valor_pis: 0,
      valor_cofins: 0,
      valor_frete: 0,
      valor_seguro: 0,
      valor_desconto: 0,
      valor_outras: 0,
      valor_total_tributos: 0,
      valor_bc_st: 0,
      valor_st: 0,
      valor_icms_desonerado: 0,
      valor_ii: 0,
      valor_servicos: 0,
      valor_iss: 0,
      natureza_operacao: '---',
      chave_nfe: '',
      cod_categoria: '',
      modalidade_frete: '',
      id_pedido: 0,
      id_recebimento: 0,
      id_transportador: 0,
      importado_api: 'N',
      data_alteracao: '',
      hora_alteracao: '',
      data_inclusao: '',
      hora_inclusao: '',
      usuario_alteracao: '',
      usuario_inclusao: '',
      itens: [],
      titulos: [],
    };
  }

  const ide = nf.ide || {};
  const dest = nf.nfDestInt || {};
  const emit = nf.nfEmitInt || {};
  const compl = nf.compl || {};
  const info = nf.info || {};
  const total = nf.total || {};
  const icmsTot = total.ICMSTot || {};
  const issqnTot = total.ISSQNtot || {};
  const det = nf.det || [];
  const titulos = nf.titulos || [];

  const cDeneg = ide.cDeneg || 'N';
  let statusLabel = '';
  if (cDeneg === 'S') statusLabel = 'Denegado';
  else if (ide.dCan) statusLabel = 'Cancelado';
  else {
    const rawStatus = ide.cStatus || '';
    if (rawStatus === 'F') statusLabel = 'Faturado';
    else if (rawStatus === 'C') statusLabel = 'Cancelado';
    else if (rawStatus === 'D') statusLabel = 'Denegado';
    else if (rawStatus === 'A') statusLabel = 'Autorizado';
    else statusLabel = rawStatus || 'Pendente';
  }

  const retencoes = total.Retencoes || {};
  
  const itensMapped = det.map((item: any) => {
    const prod = item.prod || {};
    const nfProdInt = item.nfProdInt || {};
    return {
      codigo_produto: prod.cProd || '',
      descricao: prod.xProd || '',
      ncm: prod.NCM || '',
      cfop: prod.CFOP || '',
      unidade: prod.uCom || '',
      quantidade: prod.qCom || 0,
      valor_unitario: prod.vUnCom || 0,
      valor_total: prod.vProd || 0,
      valor_total_item: prod.vTotItem || 0,
      valor_desconto: prod.vDesc || 0,
      valor_frete: prod.vFrete || 0,
      valor_seguro: prod.vSeg || 0,
      valor_outras: prod.vOutro || 0,
      ean: prod.cEAN || '',
      origem: prod.cOrigem || '',
      nCodProd: nfProdInt.nCodProd || 0,
      nCodItem: nfProdInt.nCodItem || 0,
    };
  });

  const titulosMapped = titulos.map((t: any) => ({
    numero_titulo: t.cNumTitulo || '',
    documento: t.cDoc || '',
    parcela: t.nParcela || 0,
    total_parcelas: t.nTotParc || 0,
    valor: t.nValorTitulo || 0,
    data_emissao: t.dDtEmissao || '',
    data_vencimento: t.dDtVenc || '',
    data_previsao: t.dDtPrevisao || '',
    cod_categoria: t.cCodCateg || '',
    cod_titulo: t.nCodTitulo || 0,
  }));

  return {
    id_nf: compl.nIdNF || nf.id_nf || 0,
    numero_nf: (ide.nNF || '---').toString(),
    serie: ide.serie || '---',
    modelo: ide.mod || '---',
    data_emissao: ide.dEmi || '',
    hora_emissao: ide.hEmi || '',
    data_registro: ide.dReg || '',
    data_saida_entrada: ide.dSaiEnt || '',
    hora_saida_entrada: ide.hSaiEnt || '',
    status_nf: statusLabel,
    tipo_nf: ide.tpNF || '',
    finalidade_nfe: ide.finNFe || '',
    tipo_ambiente: ide.tpAmb || '',
    indicador_pagamento: ide.indPag || '',
    denegado: cDeneg,
    data_cancelamento: ide.dCan || '',
    data_inutilizacao: ide.dInut || '',
    razao_social: dest.xNome || 'Desconhecido',
    cnpj_cpf: dest.cnpj_cpf || '---',
    cod_cliente: dest.nCodCli || 0,
    cod_empresa: emit.nCodEmp || 0,
    valor_total_nf: icmsTot.vNF || 0,
    valor_produtos: icmsTot.vProd || 0,
    valor_icms: icmsTot.vICMS || 0,
    valor_bc_icms: icmsTot.vBC || 0,
    valor_ipi: icmsTot.vIPI || 0,
    valor_pis: icmsTot.vPIS || retencoes.vPIS || retencoes.vPISRetido || 0,
    valor_cofins: icmsTot.vCOFINS || retencoes.vCOFINS || retencoes.vCOFINSRetido || 0,
    valor_frete: icmsTot.vFrete || 0,
    valor_seguro: icmsTot.vSeg || 0,
    valor_desconto: icmsTot.vDesc || 0,
    valor_outras: icmsTot.vOutro || 0,
    valor_total_tributos: icmsTot.vTotTrib || 0,
    valor_bc_st: icmsTot.vBCST || 0,
    valor_st: icmsTot.vST || 0,
    valor_icms_desonerado: icmsTot.vICMSDesonerado || 0,
    valor_ii: icmsTot.vII || 0,
    valor_servicos: issqnTot.vServ || 0,
    valor_iss: issqnTot.vISS || 0,
    natureza_operacao: compl.xNatureza || '---',
    chave_nfe: compl.cChaveNFe || '',
    cod_categoria: compl.cCodCateg || '',
    modalidade_frete: compl.cModFrete || '',
    id_pedido: compl.nIdPedido || 0,
    id_recebimento: compl.nIdReceb || 0,
    id_transportador: compl.nIdTransp || 0,
    importado_api: info.cImpAPI || 'N',
    data_alteracao: info.dAlt || '',
    hora_alteracao: info.hAlt || '',
    data_inclusao: info.dInc || '',
    hora_inclusao: info.hInc || '',
    usuario_alteracao: info.uAlt || '',
    usuario_inclusao: info.uInc || '',
    itens: itensMapped,
    titulos: titulosMapped,
    omieData: nf,
  };
}

/**
 * Maps an array of NF records.
 */
export function mapSupabaseToNfs(nfs: any[]): NfCadastroFlat[] {
  if (!Array.isArray(nfs)) return [];
  return nfs.map(mapSupabaseToNf);
}
