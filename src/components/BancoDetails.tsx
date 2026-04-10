'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBancosStore, BancoPlano } from '@/store/useBancosStore';
import { SectionCard } from '@/components/ui/SectionCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { DetailPageHeader } from '@/components/ui/DetailPageHeader';
import { DetailNotFound } from '@/components/ui/DetailNotFound';
import { DetailLoading } from '@/components/ui/DetailLoading';
import { Landmark, Shield, Building2 } from 'lucide-react';

interface ContaVinculada {
  nCodCC: number;
  descricao: string;
  tipo_conta_corrente: string;
  inativo: string;
}

export default function BancoDetails() {
  const params = useParams();
  const id = params.id as string;
  const { fetchBancoById, loading } = useBancosStore();
  const [banco, setBanco] = useState<BancoPlano | null>(null);
  const [contas, setContas] = useState<ContaVinculada[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const found = await fetchBancoById(id);
      if (found) {
        setBanco(found);
        // Fetch contas vinculadas
        try {
          const res = await fetch(`/api/supabase/bancos/${id}`);
          const data = await res.json();
          if (data.contas) setContas(data.contas);
        } catch {}
      } else {
        setNotFound(true);
      }
    }
    load();
  }, [id, fetchBancoById]);

  if (loading && !banco) return <DetailLoading message="Carregando detalhes do banco..." />;
  if (notFound || (!loading && !banco)) {
    return <DetailNotFound backHref="/bancos" backLabel="Voltar para Bancos" entityName="Banco" />;
  }
  if (!banco) return null;

  const omie = banco.omieData;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      <DetailPageHeader
        backHref="/bancos"
        title={banco.nome}
        subtitle={`Código ${banco.codigo} · ISPB ${banco.ispb}`}
        badges={
          <span className="font-mono text-sm px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            #{banco.codigo}
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard icon={Landmark} iconColor="text-blue-400" title="Identificação">
            <div className="space-y-0">
              <InfoRow label="Código do Banco" value={<span className="font-mono text-blue-400">{banco.codigo}</span>} />
              <InfoRow label="Nome" value={banco.nome} className="text-white font-semibold" />
              <InfoRow label="Código ISPB" value={<span className="font-mono text-zinc-300">{banco.ispb}</span>} />
              {omie?.tipo && <InfoRow label="Tipo" value={omie.tipo} />}
            </div>
          </SectionCard>

          {/* Contas Correntes Vinculadas */}
          <SectionCard icon={Building2} iconColor="text-emerald-400" title={`Contas Correntes Vinculadas (${contas.length})`}>
            {contas.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">Nenhuma conta corrente vinculada a este banco.</p>
            ) : (
              <div className="space-y-3">
                {contas.map((conta) => (
                  <div
                    key={conta.nCodCC}
                    className={`p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-between ${conta.inativo === 'S' ? 'opacity-50' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{conta.descricao}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{conta.tipo_conta_corrente}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-zinc-500">#{conta.nCodCC}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${conta.inativo === 'S' ? 'bg-rose-400/10 text-rose-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                        {conta.inativo === 'S' ? 'Inativa' : 'Ativa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Audit */}
        <div className="space-y-6">
          <SectionCard icon={Shield} iconColor="text-zinc-400" title="Auditoria ERP">
            <div className="space-y-0">
              {omie?.omie_id && <InfoRow label="Omie ID" value={<span className="font-mono text-xs">{omie.omie_id}</span>} />}
              {omie?.created_at && (
                <InfoRow
                  label="Criado em"
                  value={new Date(omie.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                />
              )}
              {omie?.updated_at && (
                <InfoRow
                  label="Atualizado em"
                  value={new Date(omie.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                />
              )}
              {omie?.omie_updated_at && (
                <InfoRow
                  label="Sync Omie"
                  value={new Date(omie.omie_updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                />
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
