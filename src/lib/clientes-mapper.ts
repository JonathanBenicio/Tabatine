import { ClienteCadastro } from '@/store/useClienteStore';

interface RawCliente {
  omie_id?: number;
  id?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj_cpf?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  endereco?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  optante_simples_nacional?: boolean;
}

/**
 * Maps a raw Supabase/Omie customer (cliente) record.
 */
export function mapSupabaseToCliente(c: Record<string, unknown>): ClienteCadastro {
  const raw = c as RawCliente;
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
    codigo_cliente_omie: raw.omie_id || 0,
    codigo_cliente_integracao: raw.id || '', // id uuid agora é a chave principal
    razao_social: raw.razao_social || 'Sem Razão Social',
    nome_fantasia: raw.nome_fantasia || '',
    cnpj_cpf: raw.cnpj_cpf || '',
    telefone1_ddd: '', 
    telefone1_numero: raw.telefone || '',
    email: raw.email || '',
    cidade: raw.cidade || '',
    estado: raw.estado || '',
    bairro: raw.bairro || '',
    endereco: raw.endereco || '',
    endereco_numero: raw.endereco_numero || '',
    endereco_complemento: raw.endereco_complemento || '',
    inscricao_estadual: raw.inscricao_estadual || '',
    inscricao_municipal: raw.inscricao_municipal || '',
    optante_simples_nacional: raw.optante_simples_nacional || false,
    tags: []
  };
}

/**
 * Maps an array of customers.
 */
export function mapSupabaseToClientes(clientes: Record<string, unknown>[]): ClienteCadastro[] {
  if (!Array.isArray(clientes)) return [];
  return clientes.map(mapSupabaseToCliente);
}
