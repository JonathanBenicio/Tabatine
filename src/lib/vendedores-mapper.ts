import { Vendedor } from '@/store/useVendedoresStore';

/**
 * Maps a raw Supabase/Omie vendor record to the Vendedor interface.
 */
export function mapSupabaseToVendedor(v: any): Vendedor {
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
    codigo: v.omie_id || 0,
    codInt: v.id || '', // id uuid agora é a chave principal e pode ser mapeada para codInt se necessário, ou omitida
    nome: v.nome || '---',
    email: v.email || '',
    comissao: v.comissao || 0,
    inativo: v.inativo ? 'S' : 'N',
    fatura_pedido: v.fatura_pedido || 'N',
    visualiza_pedido: v.visualiza_pedido || 'N'
  };
}

/**
 * Maps an array of vendors.
 */
export function mapSupabaseToVendedores(vendedores: any[]): Vendedor[] {
  if (!Array.isArray(vendedores)) return [];
  return vendedores.map(mapSupabaseToVendedor);
}
