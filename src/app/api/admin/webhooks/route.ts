import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { mapSupabaseToWebhooks } from '@/lib/webhook-mapper';
import { requireAdmin } from '@/utils/supabase/auth-guard';
import { apiError } from '@/utils/api-error';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
    const status = searchParams.get('status');
    const event = searchParams.get('event');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search');

    // Calculate range for pagination
    const fromRange = (page - 1) * pageSize;
    const toRange = fromRange + pageSize - 1;

    let query = supabase
      .from('webhook_events')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      const statusArray = status.split(',');
      // Se incluir 'Completed', também buscamos 'Processed' (legado)
      if (statusArray.includes('Completed')) {
        statusArray.push('Processed');
      }
      query = query.in('status', statusArray);
    }

    if (event) {
      query = query.ilike('event', `%${event}%`);
    }

    if (from) {
      query = query.gte('created_at', from);
    }

    if (to) {
      query = query.lte('created_at', to);
    }

    if (search) {
      query = query.or(`event.ilike.%${search}%,last_error_detail.ilike.%${search}%,message_id.ilike.%${search}%`);
    }

    // Sort by creation date descending
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(fromRange, toRange);

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    const items = mapSupabaseToWebhooks(data);
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    return apiError(error, 'GET /api/admin/webhooks');
  }
}
