import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('webhook_events')
      .update({ 
        status: 'Pending',
        retry_count: 0,
        next_retry_at: null,
        last_error_detail: null
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      id,
      message: 'Evento colocado na fila para re-processamento',
      newStatus: 'Pending',
      retryCount: 0
    }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[API /admin/webhooks/${id}/retry] POST error:`, message);
    return NextResponse.json({ error: 'Erro ao re-processar evento no Supabase' }, { status: 500 });
  }
}
