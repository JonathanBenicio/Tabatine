// src/lib/condicoes-mapper.ts
import { CondicaoPlana } from '@/store/useCondicoesStore';

interface RawCondicao {
  id: string;
  codigo?: string;
  descricao?: string;
  numero_parcelas?: number | string;
  inativo?: string;
}

export function mapSupabaseToCondicao(raw: Record<string, unknown>): CondicaoPlana {
  const r = raw as unknown as RawCondicao;
  if (!raw) return { id: '', codigo: '', descricao: '', parcelas: 0, ativos: false, omieData: undefined };

  return {
    id: r.id,
    codigo: r.codigo || 'N/A',
    descricao: r.descricao || 'Sem Descrição',
    parcelas: Number(r.numero_parcelas || 0),
    ativos: r.inativo !== 'S',
    omieData: raw
  };
}

export function mapSupabaseToCondicoes(rawArray: Record<string, unknown>[]): CondicaoPlana[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToCondicao);
}
