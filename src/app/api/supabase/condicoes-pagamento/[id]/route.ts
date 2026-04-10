import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: condicao, error } = await supabase
      .from('condicoes_pagamento')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !condicao) {
      return NextResponse.json({ error: 'Condição não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ condicao });
  } catch (error: any) {
    console.error('API /condicoes-pagamento/[id] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
