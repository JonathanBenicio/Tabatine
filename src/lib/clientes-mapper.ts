import { ClienteCadastro } from '@/store/useClienteStore';

/**
 * Maps a raw Supabase/Omie customer (cliente) record.
 */
export function mapSupabaseToCliente(c: any): ClienteCadastro {
  if (!c) {
    return {
      codigo_cliente_omie: 0,
      codigo_cliente_integracao: '',
      razao_social: 'Cliente não encontrado',
      nome_fantasia: '',
      cnpj_cpf: '',
      telefone1_ddd: '',
      telefone1_numero: '',
      email: '',
      cidade: '',
      estado: '',
      tags: []
    };
  }

  return {
    codigo_cliente_omie: c.omie_id || 0,
    codigo_cliente_integracao: c.id || '', // id uuid agora é a chave principal
    razao_social: c.razao_social || 'Sem Razão Social',
    nome_fantasia: c.nome_fantasia || '',
    cnpj_cpf: c.cnpj_cpf || '',
    telefone1_ddd: '', 
    telefone1_numero: c.telefone || '',
    email: c.email || '',
    cidade: c.cidade || '',
    estado: c.estado || '',
    bairro: c.bairro || '',
    endereco: c.endereco || '',
    endereco_numero: c.endereco_numero || '',
    endereco_complemento: c.endereco_complemento || '',
    inscricao_estadual: c.inscricao_estadual || '',
    inscricao_municipal: c.inscricao_municipal || '',
    optante_simples_nacional: c.optante_simples_nacional || false,
    tags: []
  };
}

/**
 * Maps an array of customers.
 */
export function mapSupabaseToClientes(clientes: any[]): ClienteCadastro[] {
  if (!Array.isArray(clientes)) return [];
  return clientes.map(mapSupabaseToCliente);
}
