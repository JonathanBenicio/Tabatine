import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  WebhookListResponse,
  WebhookEventDetailDto,
  WebhookStats,
  WebhookFilters,
  BulkRetryResponse,
  RetryResponse,
} from '@/types/webhook';

// ─── Fetchers ──────────────────────────────────────────────────────────────

async function fetchWebhooks(filters: WebhookFilters): Promise<WebhookListResponse> {
  const params = new URLSearchParams();

  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((s) => params.append('status', s));
  }
  if (filters.event) params.set('event', filters.event);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.search) params.set('search', filters.search);

  const res = await fetch(`/api/admin/webhooks?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Erro ao buscar webhooks');
  }
  return res.json();
}

async function fetchWebhookDetail(id: string): Promise<WebhookEventDetailDto> {
  const res = await fetch(`/api/admin/webhooks/${id}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Evento não encontrado');
  }
  return res.json();
}

async function fetchWebhookStats(): Promise<WebhookStats> {
  const res = await fetch('/api/admin/webhooks/stats');
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Erro ao buscar estatísticas');
  }
  return res.json();
}

async function retryWebhook(id: string): Promise<RetryResponse> {
  const res = await fetch(`/api/admin/webhooks/${id}/retry`, { method: 'POST' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Erro ao re-processar');
  }
  return res.json();
}

async function dismissWebhook(id: string): Promise<void> {
  const res = await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const data = await res.json();
    throw new Error(data.error ?? 'Erro ao descartar evento');
  }
}

async function bulkRetryWebhooks(ids: string[]): Promise<BulkRetryResponse> {
  const res = await fetch('/api/admin/webhooks/bulk-retry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? 'Erro no bulk retry');
  }
  return res.json();
}

// ─── Queries ───────────────────────────────────────────────────────────────

export function useWebhooksQuery(filters: WebhookFilters) {
  return useQuery({
    queryKey: ['webhooks', filters],
    queryFn: () => fetchWebhooks(filters),
    placeholderData: (prev) => prev,
    staleTime: 15_000,
  });
}

export function useWebhookDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['webhook-detail', id],
    queryFn: () => fetchWebhookDetail(id!),
    enabled: Boolean(id),
    staleTime: 10_000,
  });
}

export function useWebhookStatsQuery() {
  return useQuery({
    queryKey: ['webhook-stats'],
    queryFn: fetchWebhookStats,
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useRetryWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook-stats'] });
    },
  });
}

export function useDismissWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook-stats'] });
    },
  });
}

export function useBulkRetryWebhooks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkRetryWebhooks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook-stats'] });
    },
  });
}
