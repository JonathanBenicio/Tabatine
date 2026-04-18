import { NextResponse } from "next/server";
import { requireAdmin } from '@/utils/supabase/auth-guard';
import { apiError } from '@/utils/api-error';

const globalWithWebhooks = global as typeof globalThis & {
  webhookEvents?: Record<string, unknown>[];
};

export async function GET() {
  try {
    await requireAdmin();
    const events = globalWithWebhooks.webhookEvents || [];
    return NextResponse.json(events);
  } catch (error) {
    return apiError(error, 'GET /api/webhooks/recent');
  }
}
