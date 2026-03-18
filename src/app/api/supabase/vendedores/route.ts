import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('Vendedores')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`Nome.ilike.%${search}%,Email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('Nome', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({ 
      vendedores: data,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: any) {
    console.error('API Error (Supabase Vendedores):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
