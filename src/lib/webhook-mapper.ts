import { WebhookEventDto, WebhookEventDetailDto, WebhookStatus } from '@/types/webhook';

interface RawWebhook {
  id: string;
  app_key: string;
  event: string;
  status: string;
  retry_count?: number;
  max_retries?: number;
  created_at: string;
  processed_at: string | null;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  last_error_detail: string | null;
  message_id: string | null;
  payload?: unknown;
}

/**
 * Maps a raw row from Supabase's webhook_events table to a WebhookEventDto.
 * Standardizes snake_case to camelCase and handles status normalization.
 */
export function mapSupabaseToWebhook(raw: Record<string, unknown>): WebhookEventDto {
  const r = raw as unknown as RawWebhook;
  if (!raw) return {} as WebhookEventDto;

  return {
    id: r.id,
    appKey: r.app_key,
    event: r.event,
    // Normalizes 'Processed' (old) to 'Completed' (standard)
    status: (r.status === 'Processed' ? 'Completed' : r.status) as WebhookStatus,
    retryCount: Number(r.retry_count ?? 0),
    maxRetries: Number(r.max_retries ?? 5),
    createdAt: r.created_at,
    processedAt: r.processed_at,
    lastAttemptAt: r.last_attempt_at,
    nextRetryAt: r.next_retry_at,
    lastErrorDetail: r.last_error_detail,
    messageId: r.message_id,
  };
}

/**
 * Maps a raw row from Supabase to a WebhookEventDetailDto (includes payload).
 */
export function mapSupabaseToWebhookDetail(raw: Record<string, unknown>): WebhookEventDetailDto {
  const r = raw as unknown as RawWebhook;
  const base = mapSupabaseToWebhook(raw);
  
  let payloadStr: string | null = null;
  if (r.payload !== undefined && r.payload !== null) {
    if (typeof r.payload === 'object') {
      payloadStr = JSON.stringify(r.payload, null, 2);
    } else {
      payloadStr = String(r.payload);
    }
  }

  return {
    ...base,
    payload: payloadStr,
  };
}

/**
 * Maps an array of raw Supabase rows to WebhookEventDto[].
 */
export function mapSupabaseToWebhooks(rawArray: Record<string, unknown>[] | null): WebhookEventDto[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToWebhook);
}
