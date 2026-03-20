import { createClient } from '@/utils/supabase/server';
import { escapeFilterValue } from '@/utils/supabase/filter-utils';
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
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('Clientes')
      .select('*', { count: 'exact' });

    // Handle single item fetch if omieId is provided
    if (omieId) {
      const { data, error } = await query.eq('OmieId', parseInt(omieId)).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      return NextResponse.json({
        clientes: data ? [data] : [],
        total_de_paginas: data ? 1 : 0,
        total_de_registros: data ? 1 : 0,
        pagina: 1
      });
    }

    if (search) {
      const escapedSearch = escapeFilterValue(`%${search}%`);
      query = query.or(`RazaoSocial.ilike.${escapedSearch},NomeFantasia.ilike.${escapedSearch},CnpjCpf.ilike.${escapedSearch}`);
    }

    const { data, error, count } = await query
      .order('RazaoSocial', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      clientes: data,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: any) {
    console.error('API Error (Supabase Clientes):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
