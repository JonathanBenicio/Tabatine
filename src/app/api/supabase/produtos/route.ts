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
    const PRODUTO_COLUMN_MAP: Record<string, string> = {
      descricao: 'Descricao',
      codigo: 'CodigoProduto',
      unidade: 'UnidadeMedida',
      valor_unitario: 'PrecoUnitario',
      ncm: 'Ncm',
      familia_produto: 'FamiliaProduto',
      excluido: 'Ativo',
    };
    const sortField = PRODUTO_COLUMN_MAP[sortFieldFront] || sortFieldFront;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('Produtos')
      .select('*', { count: 'exact' });

    // Handle single item fetch if omieId is provided
    if (omieId) {
      const { data, error } = await query.eq('OmieId', parseInt(omieId)).single();
      if (error && error.code !== 'PGRST116') throw error;
      
      return NextResponse.json({
        produtos: data ? [data] : [],
        total_de_paginas: data ? 1 : 0,
        total_de_registros: data ? 1 : 0,
        pagina: 1
      });
    }

    if (search) {
      query = query.or(`Descricao.ilike.%${search}%,CodigoProduto.ilike.%${search}%`);
    }

    if (familia) {
      query = query.eq('FamiliaProduto', familia);
    }

    if (status) {
      // Logic for Ativo: stored as boolean in DB, 'Ativo' column
      const isAtivo = status === 'Ativo';
      query = query.eq('Ativo', isAtivo);
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
