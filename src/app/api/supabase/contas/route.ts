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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('ContasCorrente')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`Descricao.ilike.%${search}%,CodigoBanco.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('Descricao', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({ 
      contas: data,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: any) {
    console.error('API Error (Supabase Contas):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
