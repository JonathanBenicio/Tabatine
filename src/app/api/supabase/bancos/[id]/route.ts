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
      return apiError(null, 'GET /api/supabase/bancos/[id] (Unauthorized)', 401);
    }

    const { id } = await params;

    const { data: banco, error } = await supabase
      .from('bancos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !banco) {
      return apiError(error, 'GET /api/supabase/bancos/[id] (Not Found)', 404);
    }

    // Cross-reference: contas correntes que usam este banco
    const { data: contas } = await supabase
      .from('contas_corrente')
      .select('nCodCC, descricao, tipo_conta_corrente, inativo')
      .eq('codigo_banco', banco.codigo_banco)
      .order('descricao', { ascending: true });

    return NextResponse.json({ banco, contas: contas || [] });
  } catch (error: unknown) {
    return apiError(error, 'GET /api/supabase/bancos/[id]');
  }
}
