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

    const { data: etapa, error } = await supabase
      .from('etapas_faturamento')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !etapa) {
      return NextResponse.json({ error: 'Etapa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ etapa });
  } catch (error: any) {
    console.error('API /etapas-faturamento/[id] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
