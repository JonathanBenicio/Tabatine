import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const ENGINE_URL = process.env.TABATINE_ENGINE_URL ?? 'http://localhost:5000';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  const status = searchParams.get('status');
  const event = searchParams.get('event');
  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '20';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const search = searchParams.get('search');

  if (status) params.set('status', status);
  if (event) params.set('event', event);
  params.set('page', page);
  params.set('pageSize', pageSize);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (search) params.set('search', search);

  const url = `${ENGINE_URL}/admin/webhooks?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error ?? 'Erro ao buscar webhooks' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[API /admin/webhooks] GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
