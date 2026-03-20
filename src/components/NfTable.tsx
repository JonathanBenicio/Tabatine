'use client';

import React, { useMemo } from 'react';
import { useNfStore, NfCadastroFlat } from '@/store/useNfStore';
import { Search, FileText, AlertCircle, RefreshCw, Eye, CheckCircle2, XCircle, Clock, Hash, User, ShieldCheck, DollarSign, Ban } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Pagination from './Pagination';
import Link from 'next/link';
import { useNfQuery } from '@/hooks/useNfQuery';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<NfCadastroFlat>();

export default function NfTable() {
  const { 
    currentPage, searchTerm, setSearchTerm, setCurrentPage 
  } = useNfStore();

  const { data, isLoading, error, refetch } = useNfQuery(currentPage, searchTerm);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return '---';
      if (dateStr.includes('/')) return dateStr;
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'faturado' || s === 'concluido' || s === 'f' || s === 'autorizado' || s === 'a') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black tracking-tight uppercase shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CheckCircle2 size={10} />
          {status}
        </span>
      );
    }
    if (s === 'cancelado' || s === 'c') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black tracking-tight uppercase shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <XCircle size={10} />
          {status}
        </span>
      );
    }
    if (s === 'denegado' || s === 'd') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black tracking-tight uppercase shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          <Ban size={10} />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black tracking-tight uppercase shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <Clock size={10} />
        {status || 'Pendente'}
      </span>
    );
  };

  const stats = useMemo(() => {
    const nfs = data?.nfs || [];
    const faturados = nfs.filter(n => ['faturado', 'autorizado'].includes(n.status_nf.toLowerCase()));
    const cancelados = nfs.filter(n => n.status_nf.toLowerCase() === 'cancelado');
    const totalFaturado = faturados.reduce((sum, n) => sum + (n.valor_total_nf || 0), 0);
    const totalCancelado = cancelados.reduce((sum, n) => sum + (n.valor_total_nf || 0), 0);
    return { faturados: faturados.length, cancelados: cancelados.length, totalFaturado, totalCancelado };
  }, [data?.nfs]);

  const columns = useMemo(() => [
    columnHelper.accessor('data_emissao', {
      header: 'Emissão',
      cell: info => <span className="text-xs font-medium text-zinc-400 font-mono">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor('numero_nf', {
      header: 'NF-e No.',
      cell: info => <span className="text-sm font-bold text-white tracking-tight">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('serie', {
      header: 'Série / Mod.',
      cell: info => (
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-white font-mono uppercase tracking-tight">S: {info.getValue()}</span>
          <span className="text-[9px] text-zinc-500 font-mono italic">M: {info.row.original.modelo || '55'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('razao_social', {
      header: 'Destinatário / Cliente',
      cell: info => (
        <div className="flex items-center gap-2">
          <User size={12} className="text-zinc-600" />
          <span className="text-sm font-medium text-zinc-300 group-hover/row:text-white transition-colors">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('cnpj_cpf', {
      header: 'Doc. Cliente',
      cell: info => <span className="text-[10px] font-bold text-zinc-500 font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor('natureza_operacao', {
      header: 'Nat. Operação',
      cell: info => <span className="text-xs text-zinc-400 max-w-[150px] truncate block">{info.getValue()}</span>,
    }),
    columnHelper.accessor('valor_total_nf', {
      header: 'Valor Líquido',
      cell: info => <span className="text-sm font-black text-white group-hover/row:text-blue-400 transition-colors">{formatCurrency(info.getValue())}</span>,
      meta: { align: 'right' }
    }),
    columnHelper.accessor('status_nf', {
      header: 'Status',
      cell: info => getStatusBadge(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Ações',
      cell: info => (
        <div className="flex justify-center opacity-0 group-hover/row:opacity-100 transition-all translate-x-1 group-hover/row:translate-x-0">
          <Link 
            href={`/nf/${info.row.original.id_nf}`}
            className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20" 
            title="Abrir Detalhes"
          >
            <Eye size={14} />
          </Link>
        </div>
      ),
      meta: { align: 'center' }
    }),
  ], []);

  const table = useReactTable({
    data: data?.nfs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <FileText size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Central de Notas Fiscais
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-md">Controle absoluto sobre suas emissões e faturamentos Omie.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Localizar NF-e ou cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800 focus:border-blue-500/40 rounded-xl text-sm placeholder:text-zinc-600 outline-none w-full lg:w-72 transition-all focus:ring-4 focus:ring-blue-500/5 backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="p-2.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50 group backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">NF-e Processadas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Hash size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tighter">{data?.totalRegistros || 0}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-zinc-500">Sincronização Ativa</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Faturado</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(stats.totalFaturado)}</p>
            <p className="text-[10px] text-zinc-500 mt-1">{stats.faturados} notas na página</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-xl flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Impostos (Pág.)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatCurrency(
                data?.nfs?.reduce((sum, n) => sum + (n.valor_pis || 0) + (n.valor_cofins || 0) + (n.valor_icms || 0), 0) || 0
              )}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">PIS + COFINS + ICMS</p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex gap-4 text-rose-400 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold tracking-tight">Falha na consulta</p>
            <p className="opacity-70 mt-0.5">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="group relative rounded-3xl border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/20">
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`py-5 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-sans ${header.column.columnDef.meta?.align === 'right' ? 'text-right' : header.column.columnDef.meta?.align === 'center' ? 'text-center' : ''}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {isLoading && !data ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-16"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-20"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-10"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-48"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-24"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-32"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-24 ml-auto"></div></td>
                    <td className="py-5 px-6"><div className="h-6 bg-zinc-800/50 rounded-full w-24"></div></td>
                    <td className="py-5 px-6"><div className="h-4 bg-zinc-800/50 rounded-md w-10 mx-auto"></div></td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-700">
                        <FileText size={32} />
                      </div>
                      <p className="text-zinc-400 font-medium">Nenhum registro sincronizado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="group/row hover:bg-blue-500/[0.02] transition-all duration-300"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-5 px-6 text-xs font-medium text-zinc-400 font-mono">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPaginas={data?.totalPaginas || 1}
          onPageChange={setCurrentPage}
          loading={isLoading}
        />

        {/* Floating Loading Overlay */}
        {isLoading && data && (
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col justify-center items-center z-20">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-4">Sincronizando...</p>
          </div>
        )}
      </div>
    </div>
  );
}
