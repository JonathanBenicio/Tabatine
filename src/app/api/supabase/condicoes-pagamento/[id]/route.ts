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
      return apiError(null, 'GET /api/supabase/condicoes-pagamento/[id] (Unauthorized)', 401);
    }

    const { id } = await params;

    const { data: condicao, error } = await supabase
      .from('condicoes_pagamento')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !condicao) {
      return apiError(error, 'GET /api/supabase/condicoes-pagamento/[id] (Not Found)', 404);
    }

    return NextResponse.json({ condicao });
  } catch (error: unknown) {
    return apiError(error, 'GET /api/supabase/condicoes-pagamento/[id]');
  }
}
