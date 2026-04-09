import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const ENGINE_URL = process.env.TABATINE_ENGINE_URL ?? 'http://localhost:5000';

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
    const response = await fetch(`${ENGINE_URL}/admin/webhooks/${id}/retry`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error ?? 'Erro ao re-processar evento' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 202 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[API /admin/webhooks/${id}/retry] POST error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
