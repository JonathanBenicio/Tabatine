/**
 * Utility to map frontend field names to Supabase column names.
 * This helps maintain a clean frontend while interacting with the database schema.
 */

export const PRODUTO_COLUMN_MAP: Record<string, string> = {
  descricao: 'Descricao',
  codigo: 'CodigoProduto',
  unidade: 'UnidadeMedida',
  valor_unitario: 'ValorUnitario',
  ncm: 'Ncm',
  familia_produto: 'FamiliaProduto',
  excluido: 'Ativo', // Inverse logic needed in API or DB
};

export const VENDA_COLUMN_MAP: Record<string, string> = {
  data: 'DataInclusao',
  pedido: 'NumeroPedido',
  numeroPedido: 'NumeroPedido',
  cliente: 'ClienteId',
  vendedor: 'VendedorId',
  valorTotal: 'ValorTotal',
  etapa: 'Etapa',
  nf: 'NotasFiscais.NumeroNf',
  formaPg: 'MeioPagamento',
  banco: 'ContasCorrente.Descricao',
  vencimentoStatus: 'Etapa', // Closest match in standard table
};

/**
 * Gets the database column name for a given frontend field.
 */
export function getDbColumn(field: string, map: Record<string, string>): string {
  return map[field] || field;
}
