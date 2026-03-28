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
    codigo_cliente_omie: c.OmieId || 0,
    codigo_cliente_integracao: c.CodigoClienteIntegracao || '',
    razao_social: c.RazaoSocial || 'Sem Razão Social',
    nome_fantasia: c.NomeFantasia || '',
    cnpj_cpf: c.CnpjCpf || '',
    telefone1_ddd: '', // Split logic if needed
    telefone1_numero: c.Telefone || '',
    email: c.Email || '',
    cidade: c.Cidade || '',
    estado: c.Estado || '',
    bairro: c.Bairro || '',
    endereco: c.Endereco || '',
    endereco_numero: c.EnderecoNumero || '',
    endereco_complemento: c.EnderecoComplemento || '',
    inscricao_estadual: c.InscricaoEstadual || '',
    inscricao_municipal: c.InscricaoMunicipal || '',
    optante_simples_nacional: c.OptanteSimplesNacional || false,
    tags: [] // Tags sync pending
  };
}

/**
 * Maps an array of customers.
 */
export function mapSupabaseToClientes(clientes: any[]): ClienteCadastro[] {
  if (!Array.isArray(clientes)) return [];
  return clientes.map(mapSupabaseToCliente);
}
