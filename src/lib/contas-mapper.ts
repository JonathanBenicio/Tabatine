import { ContaCorrente } from '@/store/useContasCorrentesStore';

/**
 * Maps a raw Supabase/Omie record to the ContaCorrente interface.
 * Centralizes the transformation logic for bank accounts across the app.
 */
export function mapSupabaseToContaCorrente(c: any): ContaCorrente {
  if (!c) {
    return {
      nCodCC: 0,
      descricao: '---',
      codigo_banco: '',
      codigo_agencia: '',
      numero_conta_corrente: '',
      tipo: '',
      tipo_conta_corrente: '',
      inativo: 'N',
      saldo_inicial: 0,
      pdv_enviar: 'N'
    };
  }

  return {
    nCodCC: c.OmieId || 0,
    descricao: c.Descricao || '---',
    codigo_banco: c.Bancos?.CodigoBanco || '',
    codigo_agencia: c.Agencia || '', // Placeholder or mapped if available
    numero_conta_corrente: c.NumeroConta || '', // Placeholder or mapped if available
    tipo: c.Tipo || '',
    tipo_conta_corrente: c.TipoContaCorrente || '', // Some records might have this
    inativo: c.Inativa ? 'S' : 'N',
    saldo_inicial: c.SaldoInicial || 0,
    pdv_enviar: c.PdvEnviar || 'N',
    codigo_integracao: c.CodigoIntegracao || '',
    omie_updated_at: c.OmieUpdatedAt || ''
  };
}

/**
 * Maps an array of raw Supabase/Omie records to an array of ContaCorrente objects.
 */
export function mapSupabaseToContasCorrentes(contas: any[]): ContaCorrente[] {
  if (!Array.isArray(contas)) return [];
  return contas.map(mapSupabaseToContaCorrente);
}
