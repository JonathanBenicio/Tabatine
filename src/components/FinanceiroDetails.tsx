'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TituloFinanceiro, mapSupabaseToFinanceiro } from '@/lib/financeiro-mapper';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { DetailPageHeader } from '@/components/ui/DetailPageHeader';
import { DetailNotFound } from '@/components/ui/DetailNotFound';
import { DetailLoading } from '@/components/ui/DetailLoading';
import { 
  Receipt, User, Calendar, 
  Clock, Shield, 
  ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';

interface FinanceiroDetailsProps {
  type: 'pagar' | 'receber';
}

export default function FinanceiroDetails({ type }: FinanceiroDetailsProps) {
  const params = useParams();
  const id = params.id as string;
  const [titulo, setTitulo] = useState<TituloFinanceiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/supabase/financeiro/${type}/${id}`);
        const data = await res.json();
        
        if (res.ok && data.titulo) {
          setTitulo(mapSupabaseToFinanceiro(data.titulo, type));
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, type]);

  if (loading) return <DetailLoading message={`Carregando detalhes do título a ${type}...`} />;
  
  if (notFound || (!loading && !titulo)) {
    return (
      <DetailNotFound 
        backHref={`/financeiro/${type}`} 
        backLabel={`Voltar para ${type === 'pagar' ? 'Contas a Pagar' : 'Contas a Receber'}`} 
        entityName={`Título a ${type}`} 
      />
    );
  }

  if (!titulo) return null;

  const isPago = titulo.status === 'Pago' || titulo.status === 'Recebido';
  const colorClass = type === 'pagar' ? 'text-rose-500' : 'text-emerald-500';
  const bgBadge = isPago 
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <DetailPageHeader
        backHref={`/financeiro/${type}`}
        title={`Documento ${titulo.numero_documento}`}
        subtitle={`${type === 'pagar' ? 'Contas a Pagar' : 'Contas a Receber'} · Título vinculado ao Omie`}
        badges={
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${bgBadge}`}>
              {titulo.status}
            </span>
            <span className="font-mono text-[10px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700/50">
              #{titulo.id.substring(0, 8)}
            </span>
          </div>
        }
      />

      {/* Stats Grid - Valores e Pagamento */}
      <SectionCard icon={Receipt} iconColor="text-emerald-500" title="Valores e Pagamento">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800/50">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider mb-1">Valor do Título</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(titulo.valor_documento)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800/50">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider mb-1">
              {type === 'pagar' ? 'Total Pago' : 'Total Recebido'}
            </p>
            <p className={`text-xl font-black ${colorClass}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(titulo.valor_pago_recebido)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800/50">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider mb-1">Saldo em Aberto</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(titulo.valor_saldo)}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identificação */}
          <SectionCard icon={Receipt} iconColor="text-blue-500" title="Dados do Título">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-sm">
              <InfoRow label="Número Documento" value={titulo.numero_documento} />
              <InfoRow label="Parcela" value={titulo.numero_parcela} />
              <InfoRow label="Número Pedido" value={titulo.numero_pedido} />
              <InfoRow label="Situação Histórica" value={titulo.status} />
            </div>
          </SectionCard>

          {/* Cliente/Fornecedor */}
          <SectionCard icon={User} iconColor="text-indigo-500" title={type === 'pagar' ? 'Fornecedor' : 'Cliente'}>
             <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800/50">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{titulo.cliente_razao_social}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-500">
                  <span className="font-mono">{titulo.cliente_cnpj_cpf}</span>
                </div>
             </div>
          </SectionCard>

          {/* Datas */}
          <SectionCard icon={Calendar} iconColor="text-amber-500" title="Cronograma">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Emissão</span>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                    {new Date(titulo.data_emissao).toLocaleDateString('pt-BR')}
                  </p>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Vencimento</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock size={14} className="text-amber-500" />
                    {new Date(titulo.data_vencimento).toLocaleDateString('pt-BR')}
                  </p>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                    {isPago ? (type === 'pagar' ? 'Pagamento' : 'Recebimento') : 'Previsão Baixa'}
                  </span>
                  <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                    {titulo.data_baixa ? new Date(titulo.data_baixa).toLocaleDateString('pt-BR') : '---'}
                  </p>
               </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SectionCard icon={Shield} iconColor="text-slate-500" title="Informações ERP">
             <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800/50">
                   <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">UUID do Supabase</span>
                   <code className="text-[10px] text-blue-500 dark:text-blue-400 font-mono break-all">{titulo.id}</code>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800/50">
                   <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Canal de Origem</span>
                   <p className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2 uppercase font-bold">
                     {type === 'pagar' ? <ArrowUpRight size={12} className="text-rose-500" /> : <ArrowDownLeft size={12} className="text-emerald-500" />}
                     Omie API Sync
                   </p>
                </div>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
