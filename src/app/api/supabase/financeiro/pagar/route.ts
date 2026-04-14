import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
      .from('titulos_pagar')
      .select('*, clientes(razao_social, cnpj_cpf)', { count: 'exact' });

    if (search) {
      // Busca simplificada por número do documento ou razão social do cliente
      query = query.or(`numero_documento.ilike.%${search}%, clientes.razao_social.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      titulos: data,
      total_de_registros: count || 0,
      total_de_paginas: Math.ceil((count || 0) / limit),
      pagina: page
    });

  } catch (error: unknown) {
    console.error('API Error (Financeiro Pagar):', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : 'Internal Server Error') : 'Internal Server Error') }, { status: 500 });
  }
}
