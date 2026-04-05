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
    nCodCC: c.omie_id || 0,
    id: c.id,
    descricao: c.descricao || '---',
    codigo_banco: c.bancos?.codigo_banco || '',
    codigo_agencia: c.agencia || '', 
    numero_conta_corrente: c.numero_conta || '', 
    tipo: c.tipo || '',
    tipo_conta_corrente: c.tipo_conta_corrente || '', 
    inativo: c.inativa === 'S' || c.inativa === true ? 'S' : 'N',
    saldo_inicial: c.saldo_inicial || 0,
    pdv_enviar: c.pdv_enviar || 'N',
    codigo_integracao: c.codigo_integracao || '',
    omie_updated_at: c.omie_updated_at || ''
  };
}

/**
 * Maps an array of raw Supabase/Omie records to an array of ContaCorrente objects.
 */
export function mapSupabaseToContasCorrentes(contas: any[]): ContaCorrente[] {
  if (!Array.isArray(contas)) return [];
  return contas.map(mapSupabaseToContaCorrente);
}
