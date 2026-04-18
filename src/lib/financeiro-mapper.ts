export interface TituloFinanceiro {
  id: string;
  numero_documento: string;
  numero_parcela: string;
  numero_pedido: string;
  data_emissao: string;
  data_vencimento: string;
  data_baixa?: string;
  valor_documento: number;
  valor_pago_recebido: number;
  valor_saldo: number;
  status: string;
  cliente_razao_social: string;
  cliente_cnpj_cpf: string;
}

interface RawFinanceiro {
  id: string;
  numero_documento?: string;
  numero_parcela?: string;
  numero_pedido?: string;
  data_emissao: string;
  data_vencimento: string;
  data_baixa?: string;
  valor_documento?: number | string;
  valor_pago?: number | string;
  valor_recebido?: number | string;
  valor_saldo?: number | string;
  status_titulo?: string;
  clientes?: {
    razao_social?: string;
    cnpj_cpf?: string;
  };
}

export function mapSupabaseToFinanceiro(rawRecord: Record<string, unknown>, type: 'pagar' | 'receber'): TituloFinanceiro {
  const raw = rawRecord as unknown as RawFinanceiro;
  return {
    id: raw.id,
    numero_documento: raw.numero_documento || '---',
    numero_parcela: raw.numero_parcela || '1/1',
    numero_pedido: raw.numero_pedido || '---',
    data_emissao: raw.data_emissao,
    data_vencimento: raw.data_vencimento,
    data_baixa: raw.data_baixa,
    valor_documento: Number(raw.valor_documento || 0),
    valor_pago_recebido: type === 'pagar' ? Number(raw.valor_pago || 0) : Number(raw.valor_recebido || 0),
    valor_saldo: Number(raw.valor_saldo || 0),
    status: raw.status_titulo || 'Pendente',
    cliente_razao_social: raw.clientes?.razao_social || 'Desconhecido',
    cliente_cnpj_cpf: raw.clientes?.cnpj_cpf || '---',
  };
}

export function mapSupabaseToFinanceiros(rawArray: Record<string, unknown>[], type: 'pagar' | 'receber'): TituloFinanceiro[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(raw => mapSupabaseToFinanceiro(raw, type));
}
