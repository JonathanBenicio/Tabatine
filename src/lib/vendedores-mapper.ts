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
    codigo: v.OmieId || 0,
    codInt: v.CodInt || '',
    nome: v.Nome || '---',
    email: v.Email || '',
    comissao: v.Comissao || 0,
    inativo: v.Inativo ? 'S' : 'N',
    fatura_pedido: v.FaturaPedido || 'N',
    visualiza_pedido: v.VisualizaPedido || 'N'
  };
}

/**
 * Maps an array of vendors.
 */
export function mapSupabaseToVendedores(vendedores: any[]): Vendedor[] {
  if (!Array.isArray(vendedores)) return [];
  return vendedores.map(mapSupabaseToVendedor);
}
