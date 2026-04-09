import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { mapSupabaseToWebhookDetail } from '@/lib/webhook-mapper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(mapSupabaseToWebhookDetail(data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[API /admin/webhooks/${id}] GET error:`, message);
    return NextResponse.json({ error: 'Erro ao buscar dados no Supabase' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('webhook_events')
      .update({ status: 'Dismissed' })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[API /admin/webhooks/${id}] DELETE error:`, message);
    return NextResponse.json({ error: 'Erro ao descartar evento no Supabase' }, { status: 500 });
  }
}
