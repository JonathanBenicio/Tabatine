// src/lib/formas-mapper.ts
import { FormaPlana } from '@/store/useFormasStore';

interface RawForma {
  id: string;
  codigo?: string;
  descricao?: string;
  quantidade_parcelas?: number | string;
  dias_parcelas?: number | string;
  lista_parcelas?: string;
}

export function mapSupabaseToForma(raw: Record<string, unknown>): FormaPlana {
  const r = raw as unknown as RawForma;
  if (!raw) return { id: '', codigo: '', descricao: '', quantidadeParcelas: 0, diasParcelas: 0, listaParcelas: '', omieData: undefined };

  return {
    id: r.id,
    codigo: r.codigo || 'N/A',
    descricao: r.descricao || 'Sem Descrição',
    quantidadeParcelas: Number(r.quantidade_parcelas || 0),
    diasParcelas: Number(r.dias_parcelas || 0),
    listaParcelas: r.lista_parcelas || '---',
    omieData: raw
  };
}

export function mapSupabaseToFormas(rawArray: Record<string, unknown>[]): FormaPlana[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToForma);
}
