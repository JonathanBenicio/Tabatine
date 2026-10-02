import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiError } from '@/utils/api-error';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return apiError(null, 'GET /api/supabase/bancos (Unauthorized)', 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const omieId = searchParams.get('omieId');

    const offset = (page - 1) * limit;

    const sortFieldRaw = searchParams.get('sortField') || 'codigo_banco';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Map frontend fields to database columns
    const fieldMapping: Record<string, string> = {
      'codigo': 'codigo_banco',
      'nome': 'nome',
      'tipo': 'tipo',
      'ispb': 'codigo_ispb'
    };

    const sortField = fieldMapping[sortFieldRaw] || sortFieldRaw;

    let query = supabase.from('bancos').select('*', { count: 'exact' });

    if (omieId) {
      query = query.eq('omie_id', omieId);
    } else if (search) {
      query = query.or(`nome.ilike.%${search}%,codigo_banco.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      registros: data || [],
      pagina: page,
      total_de_paginas: count ? Math.ceil(count / limit) : 1,
      total_de_registros: count || 0
    });
  } catch (error: unknown) {
    return apiError(error, 'GET /api/supabase/bancos');
  }
}
