import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const ENGINE_URL = process.env.TABATINE_ENGINE_URL ?? 'http://localhost:5000';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await fetch(`${ENGINE_URL}/admin/webhooks/bulk-retry`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error ?? 'Erro no bulk retry' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 202 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[API /admin/webhooks/bulk-retry] POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
