// src/lib/etapas-mapper.ts
import { EtapaPlana } from '@/store/useEtapasStore';

interface RawEtapa {
  id: string;
  codigo?: string;
  descricao?: string;
  descricao_padrao?: string;
  codigo_operacao?: string;
  descricao_operacao?: string;
  inativa?: boolean;
}

export function mapSupabaseToEtapa(raw: Record<string, unknown>): EtapaPlana {
  const r = raw as unknown as RawEtapa;
  if (!raw) return { id: '', codigo: '', descricao: '', descricaoPadrao: '', operacao: '', ativos: false, omieData: undefined };

  const descOperacao = r.descricao_operacao ? ` - ${r.descricao_operacao}` : '';
  const codigoOperacao = r.codigo_operacao || 'N/A';

  return {
    id: r.id,
    codigo: r.codigo || 'N/A',
    descricao: r.descricao || 'Sem Descrição',
    descricaoPadrao: r.descricao_padrao || r.descricao || '---',
    operacao: `${codigoOperacao}${descOperacao}`,
    ativos: !r.inativa, // if inativa is false, it's 'ativo'
    omieData: raw
  };
}

export function mapSupabaseToEtapas(rawArray: Record<string, unknown>[]): EtapaPlana[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToEtapa);
}
