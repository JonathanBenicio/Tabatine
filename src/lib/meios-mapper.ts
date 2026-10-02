// src/lib/meios-mapper.ts
import { MeioPlano } from '@/store/useMeiosStore';

interface RawMeio {
  id: string;
  codigo?: string;
  descricao?: string;
}

export function mapSupabaseToMeio(raw: Record<string, unknown>): MeioPlano {
  const r = raw as unknown as RawMeio;
  if (!raw) return { id: '', codigo: '', descricao: '', omieData: undefined };

  return {
    id: r.id,
    codigo: r.codigo || 'N/A',
    descricao: r.descricao || 'Sem Descrição',
    omieData: raw
  };
}

export function mapSupabaseToMeios(rawArray: Record<string, unknown>[]): MeioPlano[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToMeio);
}
