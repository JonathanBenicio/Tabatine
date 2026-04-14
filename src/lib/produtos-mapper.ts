import { Produto } from '@/store/useProdutosStore';

interface RawProduto {
  omie_id?: number;
  id?: string;
  codigo_produto?: string;
  descricao?: string;
  unidade_medida?: string;
  preco_unitario?: number;
  ncm?: string;
  ean?: string;
  peso_bruto?: number;
  peso_liquido?: number;
  familia_produto?: string;
  ativo?: boolean;
}

/**
 * Maps a raw Supabase/Omie product record to the Produto interface.
 * Centralizes labels and transformations for consistency.
 */
export function mapSupabaseToProduto(p: Record<string, unknown>): Produto {
  const raw = p as RawProduto;
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
    codigo_produto: raw.omie_id || 0,
    codigo_produto_integracao: raw.id || '', // id uuid agora é a chave principal
    codigo: raw.codigo_produto || '',
    descricao: raw.descricao || 'Sem Descrição',
    unidade: raw.unidade_medida || 'UN',
    valor_unitario: Number(raw.preco_unitario || 0),
    ncm: raw.ncm || '',
    ean: raw.ean || '',
    peso_bruto: Number(raw.peso_bruto || 0),
    peso_liquido: Number(raw.peso_liquido || 0),
    familia_produto: raw.familia_produto || '',
    excluido: raw.ativo ? 'N' : 'S'
  };
}

/**
 * Maps an array of raw Supabase/Omie product records.
 */
export function mapSupabaseToProdutos(produtos: Record<string, unknown>[]): Produto[] {
  if (!Array.isArray(produtos)) return [];
  return produtos.map(mapSupabaseToProduto);
}
