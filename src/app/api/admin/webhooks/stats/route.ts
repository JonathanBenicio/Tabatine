import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    // Executando contagens em paralelo para melhor performance
    const [
      pending,
      processing,
      failed,
      deadLetter,
      completedToday,
      lastEvent
    ] = await Promise.all([
      supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'Processing'),
      supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'Failed'),
      supabase.from('webhook_events').select('*', { count: 'exact', head: true }).eq('status', 'DeadLetter'),
      supabase.from('webhook_events').select('*', { count: 'exact', head: true })
        .in('status', ['Completed', 'Processed'])
        .gte('processed_at', todayIso),
      supabase.from('webhook_events').select('created_at').order('created_at', { ascending: false }).limit(1).single()
    ]);

    return NextResponse.json({
      pending: pending.count ?? 0,
      processing: processing.count ?? 0,
      failed: failed.count ?? 0,
      deadLetter: deadLetter.count ?? 0,
      completedToday: completedToday.count ?? 0,
      lastEventAt: lastEvent.data?.created_at ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[API /admin/webhooks/stats] GET error:', message);
    return NextResponse.json({ error: 'Erro ao calcular estatísticas no Supabase' }, { status: 500 });
  }
}
