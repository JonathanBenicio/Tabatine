export type WebhookStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'DeadLetter'
  | 'Dismissed';

export interface WebhookEventDto {
  id: string;
  appKey: string;
  event: string;
  status: WebhookStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  processedAt: string | null;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  lastErrorDetail: string | null;
  messageId: string | null;
}

export interface WebhookEventDetailDto extends WebhookEventDto {
  payload: string | null;
}

export interface WebhookListResponse {
  items: WebhookEventDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WebhookStats {
  pending: number;
  processing: number;
  failed: number;
  deadLetter: number;
  completedToday: number;
  lastEventAt: string | null;
}

export interface WebhookFilters {
  status?: WebhookStatus[];
  event?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  search?: string;
}

export interface BulkRetryResponse {
  enqueued: number;
  skipped: number;
  message: string;
}

export interface RetryResponse {
  id: string;
  message: string;
  newStatus: WebhookStatus;
  retryCount: number;
}
