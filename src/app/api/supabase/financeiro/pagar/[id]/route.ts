import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/utils/api-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('titulos_pagar')
      .select('*, clientes(razao_social, cnpj_cpf)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiError(error, 'GET /api/supabase/financeiro/pagar/[id]', 404);
      }
      throw error;
    }

    return NextResponse.json({ titulo: data });

  } catch (error) {
    return apiError(error, 'GET /api/supabase/financeiro/pagar/[id]');
  }
}
