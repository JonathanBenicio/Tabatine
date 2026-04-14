import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const omieId = searchParams.get('omieId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const sortField = searchParams.get('sortField') || 'descricao';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    let query = supabase
      .from('contas_corrente')
      .select('*, bancos(codigo_banco)', { count: 'exact' });

    // Handle single item fetch if omieId is provided
    if (omieId) {
      const { data, error } = await query.eq('omie_id', parseInt(omieId)).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      return NextResponse.json({ 
        contas: data ? [data] : [],
        total_de_paginas: data ? 1 : 0,
        total_de_registros: data ? 1 : 0,
        pagina: 1
      });
    }

    if (search) {
      query = query.ilike('descricao', `%${search}%`);
    }

    const { data, error, count } = await query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({ 
      contas: data,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: unknown) {
    console.error('API Error (Supabase Contas):', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : 'Internal Server Error') : 'Internal Server Error') }, { status: 500 });
  }
}
