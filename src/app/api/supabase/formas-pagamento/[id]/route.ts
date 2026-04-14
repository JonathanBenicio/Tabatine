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

    const { data: forma, error } = await supabase
      .from('formas_pagamento')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !forma) {
      return NextResponse.json({ error: 'Forma não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ forma });
  } catch (error: unknown) {
    console.error('API /formas-pagamento/[id] Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : 'Internal Server Error') : 'Internal Server Error') }, { status: 500 });
  }
}
