'use client';

import React from 'react';
import {
  RotateCcw,
  Trash2,
  Eye,
  CalendarDays,
  X,
  RefreshCw,
  Filter,
  Activity,
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
import { TableContainer } from '@/components/ui/TableContainer';
import { TableSearch } from '@/components/ui/TableSearch';
import Pagination from '../Pagination';

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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 accent-orange-500 cursor-pointer"
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleRowSelection(row.original.id)}
          disabled={!canAction(row.original.status)}
          className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 accent-orange-500 cursor-pointer disabled:opacity-30"
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
        <span className="font-mono text-[10px] text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700/50">
          {getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'retries',
      header: 'Tentativas',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
          {row.original.retryCount}
          <span className="text-slate-400 dark:text-zinc-600 font-normal">/{row.original.maxRetries}</span>
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Recebido em',
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-500 dark:text-zinc-500" title={formatDateCompact(getValue())}>
          {formatRelative(getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('nextRetryAt', {
      header: 'Próxima Tentativa',
      cell: ({ getValue, row }) => {
        if (row.original.status === 'DeadLetter' || row.original.status === 'Completed') {
          return <span className="text-slate-300 dark:text-zinc-700 text-xs">—</span>;
        }
        return (
          <span className="text-xs text-slate-500 dark:text-zinc-500">
            {formatRelative(getValue())}
          </span>
        );
      },
    }),
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 dark:hover:text-white hover:bg-orange-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Eye size={14} />
            </button>
            {actionable && (
              <>
                <button
                  onClick={() => retryMutation.mutate(row.original.id)}
                  disabled={isProcessing || retryMutation.isPending}
                  title={isProcessing ? 'Já está sendo processado' : 'Re-tentar'}
                  className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-30"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => dismissMutation.mutate(row.original.id)}
                  disabled={isProcessing || dismissMutation.isPending}
                  title={isProcessing ? 'Já está sendo processado' : 'Descartar'}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-30"
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  });

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <TableSearch 
            value={searchValue} 
            onChange={setSearchValue} 
            placeholder="Buscar por ID, evento ou erro..." 
            className="w-full md:w-96"
          />
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 rounded-xl px-3 py-1.5 gap-2 backdrop-blur-sm">
              <CalendarDays size={14} className="text-slate-400 dark:text-zinc-500" />
              <input
                type="date"
                value={filters.from ?? ''}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value || undefined, page: 1 }))}
                className="bg-transparent outline-none text-xs text-slate-700 dark:text-zinc-300"
              />
              <span className="text-slate-300 dark:text-zinc-700 text-xs">até</span>
              <input
                type="date"
                value={filters.to ?? ''}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value || undefined, page: 1 }))}
                className="bg-transparent outline-none text-xs text-slate-700 dark:text-zinc-300"
              />
            </div>

            <button
              onClick={() => refetch()}
              title="Atualizar"
              className="p-2.5 rounded-xl bg-white/50 dark:bg-zinc-900/40 border border-white/60 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-white transition-all backdrop-blur-sm"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1.5 bg-white/30 dark:bg-zinc-900/20 border border-white/40 dark:border-zinc-800/50 rounded-2xl backdrop-blur-sm">
            <div className="px-2 text-slate-400 dark:text-zinc-500">
              <Filter size={14} />
            </div>
            {ALL_STATUSES.map((status) => {
              const active = (filters.status ?? []).includes(status);
              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/20'
                      : 'border-transparent text-slate-500 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barra de Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {selectedIds.size}
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-orange-200">
              evento{selectedIds.size > 1 ? 's' : ''} selecionado{selectedIds.size > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-xs font-semibold border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Limpar
            </button>
            {showBulkConfirm ? (
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <button
                  onClick={handleBulkRetry}
                  disabled={bulkRetryMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {bulkRetryMutation.isPending ? '...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => setShowBulkConfirm(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-rose-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                <RotateCcw size={14} />
                Re-tentar Selecionados
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="relative">
        <TableContainer
          pagination={
            data && data.totalPages > 1 ? (
              <div className="px-6 py-4 border-t border-slate-200/60 dark:border-zinc-800/50 bg-slate-50/20 dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium tracking-wide">
                  Mostrando <span className="text-slate-900 dark:text-white font-bold">{table.getRowModel().rows.length}</span> eventos
                </p>
                <Pagination
                  currentPage={data.page}
                  totalPaginas={data.totalPages}
                  onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                  loading={isLoading}
                />
              </div>
            ) : undefined
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-slate-200/60 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-4 text-left text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/30 text-sm">
                {isLoading && !data ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {table.getAllLeafColumns().map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-4">
                          <div className="h-4 bg-slate-100 dark:bg-zinc-800/50 rounded-md w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                   <tr>
                     <td colSpan={table.getAllLeafColumns().length} className="px-6 py-12 text-center">
                       <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 text-rose-400 max-w-sm mx-auto">
                         <X className="w-8 h-8 opacity-50" />
                         <p className="font-medium text-sm text-rose-600 dark:text-rose-400">{(error as Error).message}</p>
                         <button onClick={() => refetch()} className="mt-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                           Tentar novamente
                         </button>
                       </div>
                     </td>
                   </tr>
                ) : !data || data.items.length === 0 ? (
                  <tr>
                    <td colSpan={table.getAllLeafColumns().length} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300 dark:text-zinc-600">
                           <Activity size={24} />
                         </div>
                         <p className="text-sm font-medium text-slate-500 dark:text-zinc-500">
                           {(filters.status ?? []).length > 0 ? 'Nenhum evento corresponde aos filtros.' : 'A fila está limpa!'}
                         </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`group transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02] ${
                        selectedIds.has(row.original.id) ? 'bg-orange-500/5 hover:bg-orange-500/10 dark:bg-orange-500/10 dark:hover:bg-orange-500/20' : ''
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
      </div>

      {/* Modal de detalhe */}
      {selectedWebhookId && (
        <WebhookDetailModal
          webhookId={selectedWebhookId}
          onClose={() => setSelectedWebhookId(null)}
        />
      )}
    </div>
  );
}
