// src/lib/meios-mapper.ts
import { MeioPlano } from '@/store/useMeiosStore';

export function mapSupabaseToMeio(raw: any): MeioPlano {
  if (!raw) return { id: '', codigo: '', descricao: '', omieData: null };

  return {
    id: raw.id,
    codigo: raw.codigo || 'N/A',
    descricao: raw.descricao || 'Sem Descrição',
    omieData: raw
  };
}

export function mapSupabaseToMeios(rawArray: any[]): MeioPlano[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToMeio);
}
