'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FormaPlana } from '@/store/useFormasStore';
import { mapSupabaseToForma } from '@/lib/formas-mapper';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { DetailPageHeader } from '@/components/ui/DetailPageHeader';
import { DetailNotFound } from '@/components/ui/DetailNotFound';
import { DetailLoading } from '@/components/ui/DetailLoading';
import { Wallet, Shield, Calendar } from 'lucide-react';

export default function FormaDetails() {
  const params = useParams();
  const id = params.id as string;
  const [forma, setForma] = useState<FormaPlana | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await fetch(`/api/supabase/formas-pagamento/${id}`);
        const data = await res.json();
        if (res.ok && data.forma) {
          setForma(mapSupabaseToForma(data.forma));
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    }
    load();
  }, [id]);

  if (!forma && !notFound) return <DetailLoading message="Carregando forma de pagamento..." />;
  if (notFound) {
    return <DetailNotFound backHref="/formas-pagamento" backLabel="Voltar para Formas" entityName="Forma de Pagamento" />;
  }
  if (!forma) return null;

  const omie = forma.omieData;

  // Parse lista_parcelas string → array of installment info
  const parcelasRaw = forma.listaParcelas;
  const parcelasList = parcelasRaw && parcelasRaw !== '---'
    ? parcelasRaw.split(',').map((p: string) => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <DetailPageHeader
        backHref="/formas-pagamento"
        title={forma.descricao}
        subtitle={`Código ${forma.codigo} · ${forma.quantidadeParcelas}x de ${forma.diasParcelas} dias`}
        badges={
          <span className="font-mono text-sm px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            #{forma.codigo}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard icon={Wallet} iconColor="text-emerald-400" title="Configuração">
            <div className="space-y-0">
              <InfoRow label="Código" value={<span className="font-mono text-emerald-400">{forma.codigo}</span>} />
              <InfoRow label="Descrição" value={forma.descricao} className="text-white font-semibold" />
              <InfoRow label="Nº de Parcelas" value={
                <span className="text-lg font-bold text-white">{forma.quantidadeParcelas}x</span>
              } />
              <InfoRow label="Dias entre Parcelas" value={
                <span className="font-semibold text-zinc-200">{forma.diasParcelas} dias</span>
              } />
            </div>
          </SectionCard>

          {/* Tabela de Parcelas */}
          {parcelasList.length > 0 && (
            <SectionCard icon={Calendar} iconColor="text-amber-400" title="Detalhamento de Parcelas">
              <div className="space-y-2">
                {parcelasList.map((parcela: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-zinc-300 flex-1 ml-3 font-mono">{parcela}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
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
