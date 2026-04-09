import { WebhookEventDto, WebhookEventDetailDto, WebhookStatus } from '@/types/webhook';

/**
 * Maps a raw row from Supabase's webhook_events table to a WebhookEventDto.
 * Standardizes snake_case to camelCase and handles status normalization.
 */
export function mapSupabaseToWebhook(raw: any): WebhookEventDto {
  if (!raw) return {} as WebhookEventDto;

  return {
    id: raw.id,
    appKey: raw.app_key,
    event: raw.event,
    // Normalizes 'Processed' (old) to 'Completed' (standard)
    status: (raw.status === 'Processed' ? 'Completed' : raw.status) as WebhookStatus,
    retryCount: Number(raw.retry_count ?? 0),
    maxRetries: Number(raw.max_retries ?? 5),
    createdAt: raw.created_at,
    processedAt: raw.processed_at,
    lastAttemptAt: raw.last_attempt_at,
    nextRetryAt: raw.next_retry_at,
    lastErrorDetail: raw.last_error_detail,
    messageId: raw.message_id,
  };
}

/**
 * Maps a raw row from Supabase to a WebhookEventDetailDto (includes payload).
 */
export function mapSupabaseToWebhookDetail(raw: any): WebhookEventDetailDto {
  const base = mapSupabaseToWebhook(raw);
  
  return {
    ...base,
    // Payload can be an object (from JSONB) or a string. 
    // If it's an object, we stringify it for consistent UI handling.
    payload: typeof raw.payload === 'object' 
      ? JSON.stringify(raw.payload, null, 2) 
      : (raw.payload || null),
  };
}

/**
 * Maps an array of raw Supabase rows to WebhookEventDto[].
 */
export function mapSupabaseToWebhooks(rawArray: any[] | null): WebhookEventDto[] {
  if (!Array.isArray(rawArray)) return [];
  return rawArray.map(mapSupabaseToWebhook);
}
