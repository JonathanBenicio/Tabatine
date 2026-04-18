import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
        return NextResponse.json({ error: 'Título não encontrado' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ titulo: data });

  } catch (error: unknown) {
    console.error('API Error (Financeiro Pagar Detail):', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : 'Internal Server Error') : 'Internal Server Error') }, { status: 500 });
  }
}
