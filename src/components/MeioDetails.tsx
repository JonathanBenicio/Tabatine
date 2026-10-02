/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MeioPlano } from '@/store/useMeiosStore';
import { mapSupabaseToMeio } from '@/lib/meios-mapper';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { DetailPageHeader } from '@/components/ui/DetailPageHeader';
import { DetailNotFound } from '@/components/ui/DetailNotFound';
import { DetailLoading } from '@/components/ui/DetailLoading';
import { Coins, Shield } from 'lucide-react';

export default function MeioDetails() {
  const params = useParams();
  const id = params.id as string;
  const [meio, setMeio] = useState<MeioPlano | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await fetch(`/api/supabase/meios-pagamento/${id}`);
        const data = await res.json();
        if (res.ok && data.meio) {
          setMeio(mapSupabaseToMeio(data.meio));
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    }
    load();
  }, [id]);

  if (!meio && !notFound) return <DetailLoading message="Carregando meio de pagamento..." />;
  if (notFound) {
    return <DetailNotFound backHref="/meios-pagamento" backLabel="Voltar para Meios" entityName="Meio de Pagamento" />;
  }
  if (!meio) return null;

  const omie = meio.omieData;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <DetailPageHeader
        backHref="/meios-pagamento"
        title={meio.descricao}
        subtitle={`Código ${meio.codigo}`}
        badges={
          <span className="font-mono text-sm px-3 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            #{meio.codigo}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard icon={Coins} iconColor="text-amber-600 dark:text-amber-400" title="Identificação">
            <div className="space-y-0">
              <InfoRow label="Código ABNT/Omie" value={<span className="font-mono text-amber-600 dark:text-amber-400">{meio.codigo}</span>} />
              <InfoRow label="Descrição" value={meio.descricao} className="text-slate-900 dark:text-white font-semibold" />
              {!!omie?.tipo && <InfoRow label="Tipo" value={omie.tipo as any} />}
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard icon={Shield} iconColor="text-slate-500 dark:text-zinc-400" title="Auditoria ERP">
            <div className="space-y-0">
              {!!omie?.omie_id && <InfoRow label="Omie ID" value={<span className="font-mono text-xs">{omie.omie_id as any}</span>} />}
              {!!omie?.created_at && (
                <InfoRow label="Criado em" value={new Date(omie.created_at as any).toLocaleDateString('pt-BR')} />
              )}
              {!!omie?.updated_at && (
                <InfoRow label="Atualizado em" value={new Date(omie.updated_at as any).toLocaleDateString('pt-BR')} />
              )}
            </div>
          </SectionCard>
        </div>

        {/* TODO: Cross-reference com pedidos que usam este meio */}
        <div className="lg:col-span-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-md flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-zinc-600">🔮 Futuro: exibir pedidos que utilizam este meio de pagamento</span>
          </div>
        </div>
      </div>
    </div>
  );
}
