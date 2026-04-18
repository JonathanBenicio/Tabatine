import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { escapeFilterValue } from '@/utils/supabase/filter-utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const sortField = searchParams.get('sortField') || 'data_vencimento';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let query = supabase
      .from('titulos_receber')
      .select('*, clientes(razao_social, cnpj_cpf)', { count: 'exact' });

    if (search) {
      const escapedSearch = escapeFilterValue(`%${search}%`);

      // 1. Busca IDs de clientes que combinam com o termo (razão social)
      const { data: matchedClientes } = await supabase
        .from('clientes')
        .select('id')
        .ilike('razao_social', `%${search}%`);
      
      const clienteIds = (matchedClientes || []).map(c => c.id);

      // 2. Constrói o filtro OR (Número do documento OU IDs de clientes encontrados)
      const orConditions = [`numero_documento.ilike.${escapedSearch}`];
      
      if (clienteIds.length > 0) {
        orConditions.push(`cliente_id.in.(${clienteIds.join(',')})`);
      }
      
      query = query.or(orConditions.join(','));
    }

    let finalQuery = query;
    if (sortField === 'cliente_razao_social') {
      finalQuery = finalQuery.order('razao_social', { referencedTable: 'clientes', ascending: sortOrder === 'asc' });
    } else {
      finalQuery = finalQuery.order(sortField, { ascending: sortOrder === 'asc' });
    }

    const { data, count, error } = await finalQuery
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      titulos: data,
      total_de_registros: count || 0,
      total_de_paginas: Math.ceil((count || 0) / limit),
      pagina: page
    });

  } catch (error: unknown) {
    console.error('API Error (Financeiro Receber):', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
