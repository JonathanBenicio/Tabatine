import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/supabase/auth-guard';
import { apiError } from '@/utils/api-error';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();

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
  } catch (error) {
    return apiError(error, 'POST /api/admin/webhooks/[id]/retry');
  }
}
