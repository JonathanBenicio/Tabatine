import { Produto } from '@/store/useProdutosStore';

/**
 * Maps a raw Supabase/Omie product record to the Produto interface.
 * Centralizes labels and transformations for consistency.
 */
export function mapSupabaseToProduto(p: any): Produto {
  if (!p) {
    return {
      codigo_produto: 0,
      codigo_produto_integracao: '',
      codigo: '',
      descricao: 'Produto não encontrado',
      unidade: 'UN',
      valor_unitario: 0,
      ncm: '',
      excluido: 'N'
    };
  }

  return {
    codigo_produto: p.OmieId || 0,
    codigo_produto_integracao: p.CodigoProdutoIntegracao || '',
    codigo: p.CodigoProduto || '',
    descricao: p.Descricao || 'Sem Descrição',
    unidade: p.UnidadeMedida || 'UN',
    valor_unitario: Number(p.PrecoUnitario || 0),
    ncm: p.Ncm || '',
    ean: p.Ean || '',
    peso_bruto: Number(p.PesoBruto || 0),
    peso_liquido: Number(p.PesoLiquido || 0),
    familia_produto: p.FamiliaProduto || '',
    excluido: p.Ativo ? 'N' : 'S'
  };
}

/**
 * Maps an array of raw Supabase/Omie product records.
 */
export function mapSupabaseToProdutos(produtos: any[]): Produto[] {
  if (!Array.isArray(produtos)) return [];
  return produtos.map(mapSupabaseToProduto);
}
