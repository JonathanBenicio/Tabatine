// src/lib/etapas-mapper.ts
import { EtapaPlana } from '@/store/useEtapasStore';

export function mapSupabaseToEtapa(raw: any): EtapaPlana {
  if (!raw) return { id: '', codigo: '', descricao: '', descricaoPadrao: '', operacao: '', ativos: false, omieData: null };

  const descOperacao = raw.descricao_operacao ? ` - ${raw.descricao_operacao}` : '';
  const codigoOperacao = raw.codigo_operacao || 'N/A';

  return {
    id: raw.id,
    codigo: raw.codigo || 'N/A',
    descricao: raw.descricao || 'Sem Descrição',
    descricaoPadrao: raw.descricao_padrao || raw.descricao || '---',
    operacao: `${codigoOperacao}${descOperacao}`,
    ativos: !raw.inativa, // if inativa is false, it's 'ativo'
    omieData: raw
  };
}

export function mapSupabaseToEtapas(rawArray: any[]): EtapaPlana[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToEtapa);
}
