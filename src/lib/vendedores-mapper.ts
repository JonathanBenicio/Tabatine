import { Vendedor } from '@/store/useVendedoresStore';

interface RawVendedor {
  omie_id?: number;
  id?: string;
  nome?: string;
  email?: string;
  comissao?: number;
  inativo?: boolean;
  fatura_pedido?: string;
  visualiza_pedido?: string;
}

/**
 * Maps a raw Supabase/Omie vendor record to the Vendedor interface.
 * Note: The structure here reflects the Supabase view/table columns.
 */
export function mapSupabaseToVendedor(v: Record<string, unknown>): Vendedor {
  const raw = v as RawVendedor;
  if (!v) {
    return {
      codigo: 0,
      codInt: '',
      nome: 'Vendedor não encontrado',
      email: '',
      comissao: 0,
      inativo: 'N',
      fatura_pedido: 'N',
      visualiza_pedido: 'N'
    };
  }

  return {
    codigo: raw.omie_id || 0,
    codInt: raw.id || '', // id uuid agora é a chave principal e pode ser mapeada para codInt se necessário, ou omitida
    nome: raw.nome || '---',
    email: raw.email || '',
    comissao: raw.comissao || 0,
    inativo: raw.inativo ? 'S' : 'N',
    fatura_pedido: raw.fatura_pedido || 'N',
    visualiza_pedido: raw.visualiza_pedido || 'N'
  };
}

/**
 * Maps an array of vendors.
 */
export function mapSupabaseToVendedores(vendedores: Record<string, unknown>[]): Vendedor[] {
  if (!Array.isArray(vendedores)) return [];
  return vendedores.map(mapSupabaseToVendedor);
}
