import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { mapSupabaseToWebhookDetail } from '@/lib/webhook-mapper';
import { requireAdmin } from '@/utils/supabase/auth-guard';
import { apiError } from '@/utils/api-error';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(mapSupabaseToWebhookDetail(data));
  } catch (error) {
    return apiError(error, 'GET /api/admin/webhooks/[id]');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('webhook_events')
      .update({ status: 'Dismissed' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error, 'DELETE /api/admin/webhooks/[id]');
  }
}
