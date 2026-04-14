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
      .from('titulos_receber')
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

  } catch (error: any) {
    console.error('API Error (Financeiro Receber Detail):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
