import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.TABATINE_ENGINE_URL ?? 'http://localhost:5000';

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const response = await fetch(`${ENGINE_URL}/admin/webhooks/stats`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error ?? 'Erro ao buscar estatísticas' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[API /admin/webhooks/stats] GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
