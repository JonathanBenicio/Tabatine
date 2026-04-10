'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCondicoesStore, CondicaoPlana } from '@/store/useCondicoesStore';
import { mapSupabaseToCondicao } from '@/lib/condicoes-mapper';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { DetailPageHeader } from '@/components/ui/DetailPageHeader';
import { DetailNotFound } from '@/components/ui/DetailNotFound';
import { DetailLoading } from '@/components/ui/DetailLoading';
import { CreditCard, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function CondicaoDetails() {
  const params = useParams();
  const id = params.id as string;
  const { loading } = useCondicoesStore();
  const [condicao, setCondicao] = useState<CondicaoPlana | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await fetch(`/api/supabase/condicoes-pagamento/${id}`);
        const data = await res.json();
        if (res.ok && data.condicao) {
          setCondicao(mapSupabaseToCondicao(data.condicao));
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    }
    load();
  }, [id]);

  if (!condicao && !notFound) return <DetailLoading message="Carregando condição de pagamento..." />;
  if (notFound) {
    return <DetailNotFound backHref="/condicoes-pagamento" backLabel="Voltar para Condições" entityName="Condição de Pagamento" />;
  }
  if (!condicao) return null;

  const omie = condicao.omieData;
  const isAtivo = condicao.ativos;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <DetailPageHeader
        backHref="/condicoes-pagamento"
        title={condicao.descricao}
        subtitle={`Código ${condicao.codigo} · ${condicao.parcelas} parcela${condicao.parcelas !== 1 ? 's' : ''}`}
        badges={
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border font-semibold ${
            isAtivo
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {isAtivo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {isAtivo ? 'Ativa' : 'Inativa'}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard icon={CreditCard} iconColor="text-emerald-400" title="Configuração">
            <div className="space-y-0">
              <InfoRow label="Código" value={<span className="font-mono text-emerald-400">{condicao.codigo}</span>} />
              <InfoRow label="Descrição" value={condicao.descricao} className="text-white font-semibold" />
              <InfoRow label="Nº de Parcelas" value={
                <span className="text-lg font-bold text-white">{condicao.parcelas}x</span>
              } />
              {omie?.dias_parcelas && (
                <InfoRow label="Dias entre Parcelas" value={`${omie.dias_parcelas} dias`} />
              )}
              <InfoRow label="Status" value={
                <span className={`font-semibold ${isAtivo ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isAtivo ? 'Ativa' : 'Inativa'}
                </span>
              } />
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard icon={Shield} iconColor="text-zinc-400" title="Auditoria ERP">
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
