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
      return apiError(authError, 'GET /api/supabase/etapas-faturamento/[id]', 401);
    }

    const { id } = await params;

    const { data: etapa, error } = await supabase
      .from('etapas_faturamento')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !etapa) {
      return apiError(error, 'GET /api/supabase/etapas-faturamento/[id]', 404);
    }

    return NextResponse.json({ etapa });
  } catch (error: unknown) {
    return apiError(error, 'GET /api/supabase/etapas-faturamento/[id]');
  }
}
