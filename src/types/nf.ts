/**
 * Shared types for Invoice (Nota Fiscal) module.
 * Moved here to break circular dependencies between stores and mappers.
 */

export interface NfItem {
  codigo_produto: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  valor_total_item: number;
  valor_desconto: number;
  valor_frete: number;
  valor_seguro: number;
  valor_outras: number;
  ean: string;
  origem: string;
  nCodProd: number;
  nCodItem: number;
}

export interface NfTitulo {
  numero_titulo: string;
  documento: string;
  parcela: number;
  total_parcelas: number;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_previsao: string;
  cod_categoria: string;
  cod_titulo: number;
}

export interface NfCadastroFlat {
  id_nf: number
  numero_nf: string
  serie: string
  modelo: string
  data_emissao: string
  hora_emissao: string
  data_registro: string
  data_saida_entrada: string
  hora_saida_entrada: string
  status_nf: string
  tipo_nf: string
  finalidade_nfe: string
  tipo_ambiente: string
  indicador_pagamento: string
  denegado: string
  data_cancelamento: string
  data_inutilizacao: string
  razao_social: string
  cnpj_cpf: string
  cod_cliente: number
  cod_empresa: number
  valor_total_nf: number
  valor_produtos: number
  valor_icms: number
  valor_bc_icms: number
  valor_ipi: number
  valor_pis: number
  valor_cofins: number
  valor_frete: number
  valor_seguro: number
  valor_desconto: number
  valor_outras: number
  valor_total_tributos: number
  valor_bc_st: number
  valor_st: number
  valor_icms_desonerado: number
  valor_ii: number
  valor_servicos: number
  valor_iss: number
  natureza_operacao: string
  chave_nfe: string
  cod_categoria: string
  modalidade_frete: string
  id_pedido: number
  id_recebimento: number
  id_transportador: number
  importado_api: string
  data_alteracao: string
  hora_alteracao: string
  data_inclusao: string
  hora_inclusao: string
  usuario_alteracao: string
  usuario_inclusao: string
  itens: NfItem[]
  titulos: NfTitulo[]
  omieData?: Record<string, unknown>
  id?: string
  [key: string]: string | number | boolean | object | undefined | null
}
