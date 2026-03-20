'use client';

import React, { useEffect, useState } from 'react';
import { useVendedoresStore, Vendedor } from '@/store/useVendedoresStore';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, UserCheck, Mail, Percent, 
  AlertCircle, RefreshCw, Database, 
  Info, ShieldCheck, User,
  Ban, CheckCircle2, History, TrendingUp,
  DollarSign, Briefcase, Hash
} from 'lucide-react';

// ── Reusable Components ────────────────────────────────────

function SectionCard({ icon: Icon, iconColor, title, children }: {
  icon: any; iconColor: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Icon className={iconColor} size={20} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, className = 'text-zinc-300' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-800/30 last:border-0">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ml-4 ${className}`}>{value || '--'}</span>
    </div>
  );
}

function DataField({ label, value, className = 'text-zinc-300', large = false }: {
  label: string; value: React.ReactNode; className?: string; large?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{label}</span>
      <p className={`${large ? 'text-xl font-black' : 'font-medium'} ${className}`}>{value || '--'}</p>
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, label, value, subValue }: {
  icon: any; iconBg: string; label: string; value: string; subValue?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{label}</p>
        <p className="text-lg font-black text-white">{value}</p>
        {subValue && <p className="text-[10px] text-zinc-500">{subValue}</p>}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function VendedorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { codigo } = params as { codigo: string };
  const { vendedores, fetchVendedores, loading } = useVendedoresStore();
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (vendedores.length === 0 && !loading) {
      fetchVendedores(1);
    }
  }, [vendedores.length, fetchVendedores, loading]);

  useEffect(() => {
    if (vendedores.length > 0) {
      const found = vendedores.find(v => v.codigo.toString() === codigo);
      if (found) {
        setVendedor(found);
      } else {
        setNotFound(true);
      }
    }
  }, [vendedores, codigo]);

  // ── Loading / Not Found ──

  if (loading && !vendedor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-vh-[50vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono animate-pulse">Buscando detalhes do vendedor...</p>
      </div>
    );
  }

  if (notFound || (!loading && !vendedor && vendedores.length > 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Vendedor não encontrado</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Não foi possível localizar os detalhes do vendedor solicitado.
        </p>
        <button 
          onClick={() => router.push('/vendedores')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Vendedores
        </button>
      </div>
    );
  }

  if (!vendedor) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/vendedores')}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{vendedor.nome}</h1>
            <div className="flex items-center gap-2">
               {vendedor.inativo === 'S' ? (
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1.5">
                  <Ban size={12} />
                  Inativo
                </span>
               ) : (
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  Ativo
                </span>
               )}
            </div>
          </div>
          <p className="text-zinc-500 mt-1 text-sm">
            E-mail: {vendedor.email || '--'} · Comissão: {vendedor.comissao}% · Omie ID: {vendedor.codigo}
          </p>
        </div>
      </div>

       {/* ═══ STAT CARDS ═══ */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Percent}
          iconBg="bg-blue-600"
          label="Taxa de Comissão"
          value={`${vendedor.comissao}%`}
        />
        <StatCard
          icon={ShieldCheck}
          iconBg={vendedor.inativo === 'S' ? 'bg-rose-600' : 'bg-emerald-600'}
          label="Status"
          value={vendedor.inativo === 'S' ? 'Inativo' : 'Ativo'}
        />
        <StatCard
          icon={Hash}
          iconBg="bg-indigo-600"
          label="Código Omie"
          value={vendedor.codigo.toString()}
        />
        <StatCard
          icon={Briefcase}
          iconBg="bg-zinc-600"
          label="Vendedor"
          value="Equipe"
        />
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── IDENTIFICAÇÃO ── */}
          <SectionCard icon={User} iconColor="text-blue-500" title="Perfil do Vendedor">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Nome Completo" value={vendedor.nome} className="text-white font-bold" large />
              <DataField label="E-mail" value={vendedor.email} className="text-indigo-400" />
              <DataField label="Código Externo" value={vendedor.codInt} />
              <DataField label="Omie ID" value={vendedor.codigo.toString()} />
            </div>
          </SectionCard>

          {/* ── CONFIGURAÇÕES COMERCIAIS ── */}
          <SectionCard icon={TrendingUp} iconColor="text-emerald-500" title="Configurações Comerciais">
             <div className="space-y-0">
                <InfoRow label="Comissão (%)" value={`${vendedor.comissao}%`} className="text-white font-bold" />
                <InfoRow label="Fatura Pedido" value={vendedor.fatura_pedido === 'S' ? 'Sim' : 'Não'} />
                <InfoRow label="Visualiza Pedido" value={vendedor.visualiza_pedido === 'S' ? 'Sim' : 'Não'} />
             </div>
          </SectionCard>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">
          
          {/* ── SISTEMA ── */}
          <SectionCard icon={Database} iconColor="text-zinc-600" title="Integração Omie">
             <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Status de Atividade</span>
                  <div className="flex items-center gap-2 mt-1">
                    {vendedor.inativo === 'S' ? (
                       <>
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-sm font-bold text-rose-400">Inativo no ERP</span>
                       </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-bold text-emerald-400">Ativo no ERP</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                   <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Referência Técnica</span>
                   <code className="text-xs text-blue-400 font-mono">vendedor_id: {vendedor.codigo}</code>
                </div>
             </div>
          </SectionCard>

          {/* ── AUDITORIA RÁPIDA ── */}
          <SectionCard icon={ShieldCheck} iconColor="text-zinc-500" title="Permissões">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                <span className="text-xs text-zinc-400">Faturar Pedidos</span>
                {vendedor.fatura_pedido === 'S' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <Ban className="text-rose-500" size={14} />}
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                <span className="text-xs text-zinc-400">Visualizar Pedidos</span>
                {vendedor.visualiza_pedido === 'S' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <Ban className="text-rose-500" size={14} />}
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
