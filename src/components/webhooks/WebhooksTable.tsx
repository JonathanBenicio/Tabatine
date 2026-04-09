'use client';

import React from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WebhookStatusBadge } from './WebhookStatusBadge';
import { WebhookDetailModal } from './WebhookDetailModal';
import {
  useWebhooksQuery,
  useRetryWebhook,
  useDismissWebhook,
  useBulkRetryWebhooks,
} from '@/hooks/useWebhooksQuery';
import type { WebhookEventDto, WebhookFilters, WebhookStatus } from '@/types/webhook';

const ALL_STATUSES: WebhookStatus[] = ['Pending', 'Processing', 'Completed', 'Failed', 'DeadLetter'];
const STATUS_LABELS: Record<WebhookStatus, string> = {
  Pending: 'Pendente',
  Processing: 'Processando',
  Completed: 'Concluído',
  Failed: 'Falhou',
  DeadLetter: 'Dead Letter',
  Dismissed: 'Descartado',
};

const columnHelper = createColumnHelper<WebhookEventDto>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyColumn = ColumnDef<WebhookEventDto, any>;

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatDateCompact(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'dd/MM HH:mm');
  } catch {
    return '—';
  }
}

const canAction = (status: WebhookStatus) => status === 'Failed' || status === 'DeadLetter';

export function WebhooksTable() {
  const [filters, setFilters] = React.useState<WebhookFilters>({
    status: ['Failed', 'DeadLetter'],
    page: 1,
    pageSize: 20,
  });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectedWebhookId, setSelectedWebhookId] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [showBulkConfirm, setShowBulkConfirm] = React.useState(false);

  const { data, isLoading, isFetching, error, refetch } = useWebhooksQuery(filters);
  const retryMutation = useRetryWebhook();
  const dismissMutation = useDismissWebhook();
  const bulkRetryMutation = useBulkRetryWebhooks();

  // Debounce da busca
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue || undefined, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const toggleStatus = (status: WebhookStatus) => {
    setFilters((prev) => {
      const current = prev.status ?? [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      return { ...prev, status: next, page: 1 };
    });
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const actionableIds = (data?.items ?? [])
      .filter((w) => canAction(w.status))
      .map((w) => w.id);
    if (selectedIds.size === actionableIds.length && actionableIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(actionableIds));
    }
  };

  const handleBulkRetry = async () => {
    await bulkRetryMutation.mutateAsync([...selectedIds]);
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
  };

  const columns: AnyColumn[] = [
    // Coluna de seleção
    columnHelper.display({
      id: 'select',
      header: () => {
        const actionableIds = (data?.items ?? [])
          .filter((w) => canAction(w.status))
          .map((w) => w.id);
        const allSelected = selectedIds.size === actionableIds.length && actionableIds.length > 0;
        return (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-rose-500 cursor-pointer"
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          disabled={!canAction(row.original.status)}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-rose-500 cursor-pointer disabled:opacity-30"
        />
      ),
      size: 40,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => <WebhookStatusBadge status={getValue()} size="sm" />,
    }),
    columnHelper.accessor('event', {
      header: 'Evento',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-zinc-200 bg-zinc-800/60 px-2 py-0.5 rounded-md">
          {getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'retries',
      header: 'Tentativas',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-zinc-300">
          {row.original.retryCount}
          <span className="text-zinc-600">/{row.original.maxRetries}</span>
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Recebido em',
      cell: ({ getValue }) => (
        <span className="text-xs text-zinc-400" title={formatDateCompact(getValue())}>
          {formatRelative(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('nextRetryAt', {
      header: 'Próxima Tentativa',
      cell: ({ getValue, row }) => {
        if (row.original.status === 'DeadLetter' || row.original.status === 'Completed') {
          return <span className="text-zinc-600 text-xs">—</span>;
        }
        return (
          <span className="text-xs text-zinc-400">
            {formatRelative(getValue())}
          </span>
        );
      },
    }),
    // Coluna de ações
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const isProcessing = row.original.status === 'Processing';
        const actionable = canAction(row.original.status);
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedWebhookId(row.original.id)}
              title="Ver detalhes"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Eye size={14} />
            </button>
            {actionable && (
              <>
                <button
                  onClick={() => retryMutation.mutate(row.original.id)}
                  disabled={isProcessing || retryMutation.isPending}
                  title={isProcessing ? 'Já está sendo processado' : 'Re-tentar'}
                  className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors disabled:opacity-30"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => dismissMutation.mutate(row.original.id)}
                  disabled={isProcessing || dismissMutation.isPending}
                  title={isProcessing ? 'Já está sendo processado' : 'Descartar'}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  });

  return (
    <>
      {/* Filtros */}
      <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm space-y-4">
        {/* Linha de filtros */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap">
          {/* Busca */}
          <div className="flex items-center bg-zinc-900/60 border border-zinc-700/50 rounded-xl px-3 py-2 gap-2 w-full md:w-72 focus-within:border-rose-500/50 transition-colors">
            <Search size={14} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por ID, erro…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600 w-full"
            />
            {searchValue && (
              <button onClick={() => setSearchValue('')}>
                <X size={12} className="text-zinc-500 hover:text-white" />
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-zinc-500 shrink-0" />
            {ALL_STATUSES.map((status) => {
              const active = (filters.status ?? []).includes(status);
              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                    active
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'border-zinc-700/50 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 ml-auto">
            <CalendarDays size={14} className="text-zinc-500" />
            <input
              type="date"
              value={filters.from ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value || undefined, page: 1 }))}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-rose-500/50 transition-colors"
            />
            <span className="text-zinc-600 text-xs">até</span>
            <input
              type="date"
              value={filters.to ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value || undefined, page: 1 }))}
              className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-rose-500/50 transition-colors"
            />

            <button
              onClick={() => refetch()}
              title="Atualizar"
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Info row */}
        {data && (
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              {data.total} eventos encontrados
              {isFetching && <span className="ml-2 text-zinc-600">Atualizando…</span>}
            </span>
            <span>
              Página {data.page} de {data.totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Barra de Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
          <span className="text-sm font-semibold text-rose-300">
            {selectedIds.size} evento{selectedIds.size > 1 ? 's' : ''} selecionado{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors"
            >
              Limpar seleção
            </button>
            {showBulkConfirm ? (
              <>
                <span className="text-xs text-rose-300">Confirmar re-tentativa em lote?</span>
                <button
                  onClick={handleBulkRetry}
                  disabled={bulkRetryMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50"
                >
                  {bulkRetryMutation.isPending ? 'Processando…' : 'Confirmar'}
                </button>
                <button
                  onClick={() => setShowBulkConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
              >
                <RotateCcw size={13} />
                Re-tentar Selecionados
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-2xl border border-zinc-800/50 overflow-hidden">
        {/* Skeleton / loading */}
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-zinc-900/20 border-b border-zinc-800/30 animate-pulse"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
              <X size={24} className="text-rose-400" />
            </div>
            <p className="text-zinc-400 text-sm">Erro ao carregar webhooks</p>
            <p className="text-zinc-600 text-xs mt-1">{String(error)}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-zinc-300 font-semibold">Nenhum evento encontrado</p>
            <p className="text-zinc-600 text-sm mt-1">
              {(filters.status ?? []).length > 0
                ? 'Tente ajustar os filtros de status'
                : 'A fila está limpa!'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/60">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-[10px] uppercase font-bold text-zinc-500 tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-zinc-800/30 transition-colors hover:bg-zinc-800/20 ${
                    selectedIds.has(row.original.id) ? 'bg-rose-950/20' : ''
                  } ${row.original.status === 'DeadLetter' ? 'border-l-2 border-l-rose-500/50' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Mostrando {((data.page - 1) * data.pageSize) + 1}–{Math.min(data.page * data.pageSize, data.total)} de {data.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              disabled={(filters.page ?? 1) <= 1}
              className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => {
                const page = i + 1;
                const current = filters.page ?? 1;
                const isActive = page === current;
                return (
                  <button
                    key={page}
                    onClick={() => setFilters((p) => ({ ...p, page }))}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-rose-500 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              disabled={(filters.page ?? 1) >= data.totalPages}
              className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalhe */}
      {selectedWebhookId && (
        <WebhookDetailModal
          webhookId={selectedWebhookId}
          onClose={() => setSelectedWebhookId(null)}
        />
      )}
    </>
  );
}
