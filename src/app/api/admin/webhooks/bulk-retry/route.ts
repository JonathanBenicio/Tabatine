import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Lista de IDs inválida' }, { status: 400 });
    }

    const { error } = await supabase
      .from('webhook_events')
      .update({ 
        status: 'Pending',
        retry_count: 0,
        next_retry_at: null,
        last_error_detail: null
      })
      .in('id', ids);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      enqueued: ids.length,
      skipped: 0,
      message: `${ids.length} eventos colocados na fila para re-processamento`
    }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[API /admin/webhooks/bulk-retry] POST error:', message);
    return NextResponse.json({ error: 'Erro ao re-processar eventos no Supabase' }, { status: 500 });
  }
}
