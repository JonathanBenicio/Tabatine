'use client';

import React from 'react';
import {
  X,
  RotateCcw,
  Trash2,
  Copy,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WebhookStatusBadge } from './WebhookStatusBadge';
import { useWebhookDetailQuery, useRetryWebhook, useDismissWebhook } from '@/hooks/useWebhooksQuery';
import type { WebhookStatus } from '@/types/webhook';

interface WebhookDetailModalProps {
  webhookId: string | null;
  onClose: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return dateStr;
  }
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value ?? '—'}</span>
    </div>
  );
}

const canRetry = (status: WebhookStatus) => status === 'Failed' || status === 'DeadLetter';
const canDismiss = (status: WebhookStatus) => status === 'Failed' || status === 'DeadLetter';

export function WebhookDetailModal({ webhookId, onClose, onRetry, onDismiss }: WebhookDetailModalProps) {
  const { data: webhook, isLoading, error } = useWebhookDetailQuery(webhookId);
  const retryMutation = useRetryWebhook();
  const dismissMutation = useDismissWebhook();
  const [showRetryConfirm, setShowRetryConfirm] = React.useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = React.useState(false);
  const [copiedPayload, setCopiedPayload] = React.useState(false);

  // Fecha ao pressionar Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleRetry = async () => {
    if (!webhookId) return;
    await retryMutation.mutateAsync(webhookId);
    setShowRetryConfirm(false);
    onRetry?.();
    onClose();
  };

  const handleDismiss = async () => {
    if (!webhookId) return;
    await dismissMutation.mutateAsync(webhookId);
    setShowDismissConfirm(false);
    onDismiss?.();
    onClose();
  };

  const copyPayload = () => {
    if (!webhook?.payload) return;
    navigator.clipboard.writeText(webhook.payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const formattedPayload = React.useMemo(() => {
    if (!webhook?.payload) return null;
    try {
      return JSON.stringify(JSON.parse(webhook.payload), null, 2);
    } catch {
      return webhook.payload;
    }
  }, [webhook?.payload]);

  if (!webhookId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle size={18} className="text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {webhook?.event ?? 'Detalhe do Evento'}
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{webhookId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center p-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {String(error)}
            </div>
          </div>
        )}

        {webhook && (
          <div className="p-6 space-y-6">
            {/* Status row */}
            <div className="flex items-center gap-3 flex-wrap">
              <WebhookStatusBadge status={webhook.status} />
              <span className="text-xs text-zinc-400">
                {webhook.retryCount} / {webhook.maxRetries} tentativas
              </span>
              {webhook.nextRetryAt && webhook.status === 'Failed' && (
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock size={11} />
                  Próxima tentativa {formatRelative(webhook.nextRetryAt)}
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <DataRow label="App Key" value={
                <span className="font-mono text-xs">{webhook.appKey}</span>
              } />
              <DataRow label="Recebido em" value={formatDate(webhook.createdAt)} />
              <DataRow label="Processado em" value={formatDate(webhook.processedAt)} />
              <DataRow label="Última Tentativa" value={formatDate(webhook.lastAttemptAt)} />
              <DataRow label="Próxima Tentativa" value={formatDate(webhook.nextRetryAt)} />
              <DataRow label="Message ID" value={
                webhook.messageId
                  ? <span className="font-mono text-xs">{webhook.messageId}</span>
                  : '—'
              } />
            </div>

            {/* Error Stacktrace */}
            {webhook.lastErrorDetail && (
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 flex items-center gap-1.5">
                  <ChevronRight size={11} />
                  Erro / Stacktrace
                </p>
                <pre className="text-xs text-rose-300 bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono">
                  {webhook.lastErrorDetail}
                </pre>
              </div>
            )}

            {/* Payload */}
            {formattedPayload && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                    <ChevronRight size={11} />
                    Payload Omie
                  </p>
                  <button
                    onClick={copyPayload}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
                  >
                    <Copy size={12} />
                    {copiedPayload ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre font-mono max-h-72 overflow-y-auto">
                  {formattedPayload}
                </pre>
              </div>
            )}

            {/* Actions */}
            {(canRetry(webhook.status) || canDismiss(webhook.status)) && (
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/50">
                {canRetry(webhook.status) && (
                  <>
                    {showRetryConfirm ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400 text-xs">Isto zerará o contador de tentativas. Confirmar?</span>
                        <button
                          onClick={handleRetry}
                          disabled={retryMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {retryMutation.isPending ? 'Processando...' : 'Sim, Re-tentar'}
                        </button>
                        <button
                          onClick={() => setShowRetryConfirm(false)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRetryConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-sm font-semibold transition-all"
                      >
                        <RotateCcw size={15} />
                        Re-tentar
                      </button>
                    )}
                  </>
                )}

                {canDismiss(webhook.status) && !showRetryConfirm && (
                  <>
                    {showDismissConfirm ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-rose-400 text-xs">Esta ação é permanente. Confirmar descarte?</span>
                        <button
                          onClick={handleDismiss}
                          disabled={dismissMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {dismissMutation.isPending ? 'Descartando...' : 'Sim, Descartar'}
                        </button>
                        <button
                          onClick={() => setShowDismissConfirm(false)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDismissConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-sm font-semibold transition-all"
                      >
                        <Trash2 size={15} />
                        Descartar
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            {/* Aviso quando em processamento — fora do guard canRetry/canDismiss */}
            {['Processing'].includes(webhook.status) && (
              <div className="pt-2 border-t border-zinc-800/50">
                <p className="text-xs text-blue-400 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Evento sendo processado — ações indisponíveis
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
