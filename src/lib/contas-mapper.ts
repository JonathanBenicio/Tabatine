import { ContaCorrente } from '@/store/useContasCorrentesStore';

interface RawContaCorrente {
  omie_id?: number;
  id?: string;
  descricao?: string;
  bancos?: {
    codigo_banco?: string;
  };
  agencia?: string;
  numero_conta?: string;
  tipo?: string;
  tipo_conta_corrente?: string;
  inativa?: string | boolean;
  saldo_inicial?: number;
  pdv_enviar?: string;
  codigo_integracao?: string;
  omie_updated_at?: string;
}

/**
 * Maps a raw Supabase/Omie record to the ContaCorrente interface.
 * Centralizes the transformation logic for bank accounts across the app.
 */
export function mapSupabaseToContaCorrente(c: Record<string, unknown>): ContaCorrente {
  const raw = c as RawContaCorrente;
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
    nCodCC: raw.omie_id || 0,
    id: raw.id,
    descricao: raw.descricao || '---',
    codigo_banco: raw.bancos?.codigo_banco || '',
    codigo_agencia: raw.agencia || '', 
    numero_conta_corrente: raw.numero_conta || '', 
    tipo: raw.tipo || '',
    tipo_conta_corrente: raw.tipo_conta_corrente || '', 
    inativo: raw.inativa === 'S' || raw.inativa === true ? 'S' : 'N',
    saldo_inicial: raw.saldo_inicial || 0,
    pdv_enviar: raw.pdv_enviar || 'N',
    codigo_integracao: raw.codigo_integracao || '',
    omie_updated_at: raw.omie_updated_at || ''
  };
}

/**
 * Maps an array of raw Supabase/Omie records to an array of ContaCorrente objects.
 */
export function mapSupabaseToContasCorrentes(contas: Record<string, unknown>[]): ContaCorrente[] {
  if (!Array.isArray(contas)) return [];
  return contas.map(mapSupabaseToContaCorrente);
}
