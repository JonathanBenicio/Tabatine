import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    let query = supabase.from('meios_pagamento').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`descricao.ilike.%${search}%,codigo.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('codigo', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      registros: data || [],
      pagina: page,
      total_de_paginas: count ? Math.ceil(count / limit) : 1,
      total_de_registros: count || 0
    });
  } catch (error: unknown) {
    console.error('API /meios-pagamento Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : 'Internal Server Error') : 'Internal Server Error') }, { status: 500 });
  }
}
