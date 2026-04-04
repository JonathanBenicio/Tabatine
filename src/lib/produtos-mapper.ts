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
    codigo_produto: p.omie_id || 0,
    codigo_produto_integracao: p.id || '', // id uuid agora é a chave principal
    codigo: p.codigo_produto || '',
    descricao: p.descricao || 'Sem Descrição',
    unidade: p.unidade_medida || 'UN',
    valor_unitario: Number(p.preco_unitario || 0),
    ncm: p.ncm || '',
    ean: p.ean || '',
    peso_bruto: Number(p.peso_bruto || 0),
    peso_liquido: Number(p.peso_liquido || 0),
    familia_produto: p.familia_produto || '',
    excluido: p.ativo ? 'N' : 'S'
  };
}

/**
 * Maps an array of raw Supabase/Omie product records.
 */
export function mapSupabaseToProdutos(produtos: any[]): Produto[] {
  if (!Array.isArray(produtos)) return [];
  return produtos.map(mapSupabaseToProduto);
}
