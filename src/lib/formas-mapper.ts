// src/lib/formas-mapper.ts
import { FormaPlana } from '@/store/useFormasStore';

export function mapSupabaseToForma(raw: any): FormaPlana {
  if (!raw) return { id: '', codigo: '', descricao: '', quantidadeParcelas: 0, diasParcelas: 0, listaParcelas: '', omieData: null };

  return {
    id: raw.id,
    codigo: raw.codigo || 'N/A',
    descricao: raw.descricao || 'Sem Descrição',
    quantidadeParcelas: Number(raw.quantidade_parcelas || 0),
    diasParcelas: Number(raw.dias_parcelas || 0),
    listaParcelas: raw.lista_parcelas || '---',
    omieData: raw
  };
}

export function mapSupabaseToFormas(rawArray: any[]): FormaPlana[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToForma);
}
