import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { apiError } from '@/utils/api-error';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return apiError(error, 'GET /api/supabase/notifications');
    }

    return NextResponse.json(data || []);
  } catch (error: unknown) {
    return apiError(error, 'GET /api/supabase/notifications');
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, all } = await req.json();

    let query = supabase.from('notifications').update({ is_read: true });

    if (all) {
      query = query.eq('is_read', false);
    } else if (id) {
      query = query.eq('id', id);
    } else {
      return NextResponse.json({ error: 'Notification ID or "all" flag required' }, { status: 400 });
    }

    const { error } = await query;

    if (error) {
      return apiError(error, 'PATCH /api/supabase/notifications');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiError(error, 'PATCH /api/supabase/notifications');
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return apiError(error, 'DELETE /api/supabase/notifications');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiError(error, 'DELETE /api/supabase/notifications');
  }
}
