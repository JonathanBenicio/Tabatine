// src/lib/bancos-mapper.ts
import { BancoPlano } from '@/store/useBancosStore';

interface RawBanco {
  id: string;
  codigo_banco?: string;
  nome?: string;
  tipo?: string;
  codigo_ispb?: string;
}

export function mapSupabaseToBanco(raw: Record<string, unknown>): BancoPlano {
  const r = raw as unknown as RawBanco;
  if (!raw) return { id: '', codigo: '', nome: '', tipo: 'Desconhecido', ispb: '', omieData: undefined };

  return {
    id: r.id,
    codigo: r.codigo_banco || 'N/A',
    nome: r.nome || 'Sem Nome',
    tipo: r.tipo || 'N/A',
    ispb: r.codigo_ispb || '---',
    omieData: raw // Guarda o raw original caso necessário para tela de debug/drildown
  };
}

export function mapSupabaseToBancos(rawArray: Record<string, unknown>[]): BancoPlano[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToBanco);
}
