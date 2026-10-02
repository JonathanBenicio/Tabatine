import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/supabase/auth-guard';
import { apiError } from '@/utils/api-error';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createClient();

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
  } catch (error) {
    return apiError(error, 'POST /api/admin/webhooks/bulk-retry');
  }
}
