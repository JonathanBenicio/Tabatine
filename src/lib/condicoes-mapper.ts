// src/lib/condicoes-mapper.ts
import { CondicaoPlana } from '@/store/useCondicoesStore';

export function mapSupabaseToCondicao(raw: any): CondicaoPlana {
  if (!raw) return { id: '', codigo: '', descricao: '', parcelas: 0, ativos: false, omieData: null };

  return {
    id: raw.id,
    codigo: raw.codigo || 'N/A',
    descricao: raw.descricao || 'Sem Descrição',
    parcelas: Number(raw.numero_parcelas || 0),
    ativos: raw.inativo !== 'S',
    omieData: raw
  };
}

export function mapSupabaseToCondicoes(rawArray: any[]): CondicaoPlana[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToCondicao);
}
