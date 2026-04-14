/**
 * Omie Raw Data Interfaces
 * These interfaces represent the structure of data returned by the Omie API/Supabase proxy.
 * They are used by Mappers to provide type safety and avoid 'any'.
 */

export interface OmieCabecalho {
  codigo_pedido?: number;
  codigo_cliente?: number;
  numero_pedido?: string;
  data_pedido?: string;
  data_previsao?: string;
  etapa?: string;
  codigo_parcela?: string;
  qtde_parcelas?: number;
  meio_pagamento?: string;
}

export interface OmieDet {
  ide?: {
    codigo_item?: number;
  };
  produto?: {
    codigo?: string;
    descricao?: string;
    unidade?: string;
    valor_unitario?: number;
    valor_total?: number;
    ncm?: string;
    cfop?: string;
    quantidade?: number;
    percentual_desconto?: number;
    valor_desconto?: number;
  };
  imposto?: {
    icms?: {
      aliquota?: number;
      pICMS?: number;
      aliq_icms?: number;
      base_calculo?: number;
      vBC?: number;
      base_icms?: number;
      valor_icms?: number;
      vICMS?: number;
      cst?: string;
      CST?: string;
      cst_icms?: string;
    };
    pis_padrao?: {
      aliquota?: number;
      pPIS?: number;
      aliq_pis?: number;
      base_calculo?: number;
      vBC?: number;
      base_pis?: number;
      valor_pis?: number;
      vPIS?: number;
      cst?: string;
      CST?: string;
      cod_sit_trib_pis?: string;
    };
    cofins_padrao?: {
      aliquota?: number;
      pCOFINS?: number;
      aliq_cofins?: number;
      base_calculo?: number;
      vBC?: number;
      base_cofins?: number;
      valor_cofins?: number;
      vCOFINS?: number;
      cst?: string;
      CST?: string;
      cod_sit_trib_cofins?: string;
    };
    ipi?: {
      aliquota?: number;
      pIPI?: number;
      aliq_ipi?: number;
      base_calculo?: number;
      vBC?: number;
      base_ipi?: number;
      valor_ipi?: number;
      vIPI?: number;
      cst?: string;
      CST?: string;
      cst_ipi?: string;
    };
    ibs?: {
      valor_ibs?: number;
      aliquota_ibs_uf?: number;
      base_ibs_cbs?: number;
    };
    cbs?: {
      valor_cbs?: number;
      aliquota_cbs?: number;
      base_ibs_cbs?: number;
    };
  };
}

export interface OmieParcela {
  numero_parcela?: number;
  valor?: number;
  data_vencimento?: string;
  percentual?: number;
  meio_pagamento?: string;
  categoria?: string;
  nsu?: string;
}

export interface OmieInfoCadastro {
  dInc?: string;
  dAlt?: string;
  uInc?: string;
  uAlt?: string;
  dFat?: string;
  numero_nfe?: string;
  chave_nfe?: string;
  cancelado?: 'S' | 'N';
  denegado?: 'S' | 'N';
  autorizado?: 'S' | 'N';
  serie_nfe?: string;
  valor_total_nfe?: number;
  cliente_nome?: string;
}

export interface OmieInformacoesAdicionais {
  codVend?: number;
  vendedor_nome?: string;
  codProj?: number;
  perc_comissao?: number;
  codigo_conta_corrente?: number;
  conta_corrente_nome?: string;
  contato?: string;
  observacoes?: {
    obs_venda?: string;
  };
}

export interface OmieTotalPedido {
  valor_total_pedido?: number;
  base_calculo_icms?: number;
  valor_icms?: number;
  valor_mercadorias?: number;
  valor_IPI?: number;
  valor_pis?: number;
  valor_cofins?: number;
  valor_iss?: number;
  valor_ir?: number;
  valor_csll?: number;
  valor_inss?: number;
}

export interface OmieObservacoes {
  obs_venda?: string;
  obs_interna?: string;
  obs_nf?: string;
  obs_nf_fisco?: string;
}

export interface OmieFrete {
  modalidade?: string;
  valor_frete?: number;
  peso_bruto?: number;
  peso_liquido?: number;
  quantidade_volumes?: number;
  previsao_entrega?: string;
  codigo_transportadora?: number;
}

export interface OmiePedidoVendaProduto {
  cabecalho?: OmieCabecalho;
  det?: OmieDet[];
  frete?: OmieFrete;
  infoCadastro?: OmieInfoCadastro;
  lista_parcelas?: {
    parcela?: OmieParcela[];
  };
  informacoes_adicionais?: OmieInformacoesAdicionais;
  total_pedido?: OmieTotalPedido;
  observacoes?: OmieObservacoes;
}

export interface OmieCliente {
  codigo_cliente_omie?: number;
  codigo_cliente_integracao?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj_cpf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato?: string;
  telefone1_ddd?: string;
  telefone1_numero?: string;
  email?: string;
  tags?: { tag: { tag: string }[] };
  infoCadastro?: OmieInfoCadastro;
}

export interface OmieProduto {
  codigo_produto?: number;
  codigo_produto_integracao?: string;
  codigo?: string;
  descricao?: string;
  unidade?: string;
  valor_unitario?: number;
  ncm?: string;
  familia_nome?: string;
}

export interface OmieVendedor {
  codigo_vendedor?: number;
  codigo_vendedor_integracao?: string;
  nome?: string;
  email?: string;
  ativo?: 'S' | 'N';
}

export interface OmieContaCorrente {
  nCodCC?: number;
  cCodInt?: string;
  cDescricao?: string;
  cSigla?: string;
  cTipo?: string;
}

export interface OmieNF {
  id_nf?: number;
  ide?: {
    cStatus?: string;
    cDeneg?: 'S' | 'N';
    dCan?: string;
    dInut?: string;
    nNF?: number | string;
    serie?: string;
    mod?: string;
    dEmi?: string;
    hEmi?: string;
    dReg?: string;
    dSaiEnt?: string;
    hSaiEnt?: string;
    tpNF?: string;
    finNFe?: string;
    tpAmb?: string;
    indPag?: string;
  };
  nfDestInt?: {
    nCodCli?: number;
    xNome?: string;
    cnpj_cpf?: string;
  };
  nfEmitInt?: {
    nCodEmp?: number;
  };
  compl?: {
    nIdNF?: number;
    xNatureza?: string;
    cChaveNFe?: string;
    cCodCateg?: string;
    cModFrete?: string;
    nIdPedido?: number;
    nIdReceb?: number;
    nIdTransp?: number;
  };
  info?: {
    cImpAPI?: 'S' | 'N';
    dAlt?: string;
    hAlt?: string;
    dInc?: string;
    hInc?: string;
    uAlt?: string;
    uInc?: string;
  };
  total?: {
    ICMSTot?: {
      vNF?: number;
      vProd?: number;
      vICMS?: number;
      vBC?: number;
      vIPI?: number;
      vPIS?: number;
      vCOFINS?: number;
      vFrete?: number;
      vSeg?: number;
      vDesc?: number;
      vOutro?: number;
      vTotTrib?: number;
      vBCST?: number;
      vST?: number;
      vICMSDesonerado?: number;
      vII?: number;
    };
    ISSQNtot?: {
      vServ?: number;
      vISS?: number;
    };
    Retencoes?: {
      vPIS?: number;
      vPISRetido?: number;
      vCOFINS?: number;
      vCOFINSRetido?: number;
    };
  };
  det?: {
    prod?: {
      cProd?: string;
      xProd?: string;
      NCM?: string;
      CFOP?: string;
      uCom?: string;
      qCom?: number;
      vUnCom?: number;
      vProd?: number;
      vTotItem?: number;
      vDesc?: number;
      vFrete?: number;
      vSeg?: number;
      vOutro?: number;
      cEAN?: string;
      cOrigem?: string;
    };
    nfProdInt?: {
      nCodProd?: number;
      nCodItem?: number;
    };
    imposto?: {
      ipi?: {
        aliquota?: number;
        base_calculo?: number;
        valor_ipi?: number;
        cst?: string;
      };
    };
  }[];
  titulos?: {
    cNumTitulo?: string;
    cDoc?: string;
    nParcela?: number;
    nTotParc?: number;
    nValorTitulo?: number;
    dDtEmissao?: string;
    dDtVenc?: string;
    dDtPrevisao?: string;
    cCodCateg?: string;
    nCodTitulo?: number;
  }[];
}

export interface OmieNFSummary {
  nfDestInt?: {
    nCodCli?: number;
    xNome?: string;
  };
  nfIde?: {
    dEmis?: string;
    nNF?: string;
  };
  [key: string]: unknown;
}

