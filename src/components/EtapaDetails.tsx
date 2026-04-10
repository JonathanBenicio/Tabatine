'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EtapaPlana } from '@/store/useEtapasStore';
import { mapSupabaseToEtapa } from '@/lib/etapas-mapper';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { DetailPageHeader } from '@/components/ui/DetailPageHeader';
import { DetailNotFound } from '@/components/ui/DetailNotFound';
import { DetailLoading } from '@/components/ui/DetailLoading';
import { Layers, Shield, GitBranch, CheckCircle2, XCircle } from 'lucide-react';

export default function EtapaDetails() {
  const params = useParams();
  const id = params.id as string;
  const [etapa, setEtapa] = useState<EtapaPlana | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await fetch(`/api/supabase/etapas-faturamento/${id}`);
        const data = await res.json();
        if (res.ok && data.etapa) {
          setEtapa(mapSupabaseToEtapa(data.etapa));
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    }
    load();
  }, [id]);

  if (!etapa && !notFound) return <DetailLoading message="Carregando etapa de faturamento..." />;
  if (notFound) {
    return <DetailNotFound backHref="/etapas-faturamento" backLabel="Voltar para Etapas" entityName="Etapa de Faturamento" />;
  }
  if (!etapa) return null;

  const omie = etapa.omieData;
  const isAtivo = etapa.ativos;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <DetailPageHeader
        backHref="/etapas-faturamento"
        title={etapa.descricao}
        subtitle={`Código ${etapa.codigo}`}
        badges={
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border font-semibold ${
            isAtivo
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}>
            {isAtivo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isAtivo ? 'Ativa' : 'Inativa'}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard icon={Layers} iconColor="text-indigo-600 dark:text-indigo-400" title="Identificação">
            <div className="space-y-0">
              <InfoRow label="Código" value={<span className="font-mono text-indigo-600 dark:text-indigo-400">{etapa.codigo}</span>} />
              <InfoRow label="Descrição" value={etapa.descricao} className="text-slate-900 dark:text-white font-semibold" />
              {etapa.descricaoPadrao && etapa.descricaoPadrao !== etapa.descricao && (
                <InfoRow label="Descrição Padrão" value={etapa.descricaoPadrao} />
              )}
              <InfoRow label="Status" value={
                <span className={`font-semibold ${isAtivo ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isAtivo ? 'Ativa' : 'Inativa'}
                </span>
              } />
            </div>
          </SectionCard>

          {/* Operação Vinculada */}
          {omie?.codigo_operacao && (
            <SectionCard icon={GitBranch} iconColor="text-amber-600 dark:text-amber-400" title="Operação Vinculada">
              <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/15">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <GitBranch size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700/70 dark:text-amber-400/70 font-semibold uppercase tracking-wider mb-1">
                      Código da Operação
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{omie.codigo_operacao}</p>
                    {omie.descricao_operacao && (
                      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{omie.descricao_operacao}</p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        <div>
          <SectionCard icon={Shield} iconColor="text-slate-500 dark:text-zinc-400" title="Auditoria ERP">
            <div className="space-y-0">
              {omie?.omie_id && <InfoRow label="Omie ID" value={<span className="font-mono text-xs">{omie.omie_id}</span>} />}
              {omie?.created_at && (
                <InfoRow label="Criado em" value={new Date(omie.created_at).toLocaleDateString('pt-BR')} />
              )}
              {omie?.updated_at && (
                <InfoRow label="Atualizado em" value={new Date(omie.updated_at).toLocaleDateString('pt-BR')} />
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
