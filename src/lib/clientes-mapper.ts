import type { ClienteCadastro } from '@/store/useClienteStore';

interface RawCliente {
  omie_id?: number;
  codigo_cliente_integracao?: string | null;
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

function mapTelefone(telefone?: string): { ddd: string; numero: string } {
  const value = telefone?.trim();
  if (!value) return { ddd: '', numero: '' };

  const match = value.match(/^\(([^)]+)\)\s*(.+)$/);
  return match ? { ddd: match[1], numero: match[2] } : { ddd: '', numero: value };
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

  const telefone = mapTelefone(raw.telefone);

  return {
    codigo_cliente_omie: raw.omie_id || 0,
    codigo_cliente_integracao: raw.codigo_cliente_integracao || '',
    razao_social: raw.razao_social || 'Sem Razão Social',
    nome_fantasia: raw.nome_fantasia || '',
    cnpj_cpf: raw.cnpj_cpf || '',
    telefone1_ddd: telefone.ddd,
    telefone1_numero: telefone.numero,
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
