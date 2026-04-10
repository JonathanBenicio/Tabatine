// src/lib/bancos-mapper.ts
import { BancoPlano } from '@/store/useBancosStore';

export function mapSupabaseToBanco(raw: any): BancoPlano {
  if (!raw) return { id: '', codigo: '', nome: '', tipo: 'Desconhecido', ispb: '', omieData: null };

  return {
    id: raw.id,
    codigo: raw.codigo_banco || 'N/A',
    nome: raw.nome || 'Sem Nome',
    tipo: raw.tipo || 'N/A',
    ispb: raw.codigo_ispb || '---',
    omieData: raw // Guarda o raw original caso necessário para tela de debug/drildown
  };
}

export function mapSupabaseToBancos(rawArray: any[]): BancoPlano[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToBanco);
}
