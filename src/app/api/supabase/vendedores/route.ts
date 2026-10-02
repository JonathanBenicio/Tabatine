import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/utils/api-error';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const codigo = searchParams.get('codigo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'nome';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('vendedores')
      .select('*', { count: 'exact' });

    // Handle single item fetch if codigo is provided
    if (codigo) {
      const { data, error } = await query.eq('omie_id', parseInt(codigo)).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      return NextResponse.json({ 
        vendedores: data ? [data] : [],
        total_de_paginas: data ? 1 : 0,
        total_de_registros: data ? 1 : 0,
        pagina: 1
      });
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Map frontend sorting fields to database fields if they differ
    const columnMap: Record<string, string> = {
      'nome': 'nome',
      'email': 'email',
      'comissao': 'comissao',
      'codigo': 'omie_id'
    };

    const actualSortField = columnMap[sortField] || 'nome';

    const { data, error, count } = await query
      .order(actualSortField, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({ 
      vendedores: data,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: unknown) {
    return apiError(error, 'GET /api/supabase/vendedores');
  }
}
