import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const ENGINE_URL = process.env.TABATINE_ENGINE_URL ?? 'http://localhost:5000';

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
    const response = await fetch(`${ENGINE_URL}/admin/webhooks/${id}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error ?? 'Evento não encontrado' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[API /admin/webhooks/${id}] GET error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
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
    const response = await fetch(`${ENGINE_URL}/admin/webhooks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json({ error: data.error ?? 'Erro ao descartar evento' }, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`[API /admin/webhooks/${id}] DELETE error:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
