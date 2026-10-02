import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiError } from '@/utils/api-error';

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
      return apiError(error, 'GET /api/supabase/formas-pagamento/[id]', 404);
    }

    return NextResponse.json({ forma });
  } catch (error) {
    return apiError(error, 'GET /api/supabase/formas-pagamento/[id]');
  }
}
