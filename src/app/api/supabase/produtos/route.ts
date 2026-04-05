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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortFieldFront = searchParams.get('sortField') || 'descricao';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const familia = searchParams.get('familia') || '';
    const status = searchParams.get('status') || '';

    // ... (rest of the mapping code)
    // Map frontend field name to DB column name for filtering/sorting
    const PRODUTO_COLUMN_MAP: Record<string, string> = {
      descricao: 'descricao',
      codigo: 'codigo_produto',
      unidade: 'unidade_medida',
      valor_unitario: 'valor_unitario',
      ncm: 'ncm',
      familia_produto: 'familia_produto',
      excluido: 'ativa',
    };
    const sortField = PRODUTO_COLUMN_MAP[sortFieldFront] || sortFieldFront;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('produtos')
      .select('*', { count: 'exact' });

    // Handle single item fetch if omieId is provided
    if (omieId) {
      const { data, error } = await query.eq('omie_id', parseInt(omieId)).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      return NextResponse.json({
        produtos: data ? [data] : [],
        total_de_paginas: data ? 1 : 0,
        total_de_registros: data ? 1 : 0,
        pagina: 1
      });
    }

    if (search) {
      query = query.or(`descricao.ilike.%${search}%,codigo_produto.ilike.%${search}%`);
    }

    if (familia) {
      query = query.eq('familia_produto', familia);
    }

    if (status) {
      // Logic for Ativa: string 'S'/'N' or boolean
      const isAtiva = status === 'Ativo' ? 'S' : 'N';
      query = query.eq('ativa', isAtiva);
    }

    const { data, error, count } = await query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      produtos: data,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: any) {
    console.error('API Error (Supabase Produtos):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
