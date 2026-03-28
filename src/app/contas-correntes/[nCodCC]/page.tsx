'use client';

import React, { useEffect, useState } from 'react';
import { useContasCorrentesStore, ContaCorrente } from '@/store/useContasCorrentesStore';
import { useParams, useRouter } from 'next/navigation';
import { useVendasQuery } from '@/hooks/useVendasQuery';
import {
  ArrowLeft, Building2, CreditCard, Banknote, 
  AlertCircle, RefreshCw, Database, 
  Info, ShieldCheck, Wallet,
  Ban, CheckCircle2, DollarSign,
  Hash, Landmark, ShoppingCart, History
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

function RecentOrdersSection({ contaCorrenteId }: { contaCorrenteId: number }) {
  const { data, isLoading } = useVendasQuery(1, 10, '', [], [], { contaCorrenteId });
  const router = useRouter();
  const orders = data?.vendas?.slice(0, 5) || [];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl h-full">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <ShoppingCart className="text-indigo-500" size={16} />
        Vendas Recentemente Vinculadas
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />)}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((order: any) => (
            <div 
              key={order.id_linha}
              onClick={() => router.push(`/vendas?search=${order.numeroPedido}`)}
              className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer flex justify-between items-center group"
            >
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  #{order.numeroPedido}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 group-hover:text-zinc-300">{order.etapa}</span>
                </p>
                <p className="text-[10px] text-zinc-500">{order.data}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-indigo-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.valorTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic py-4">Nenhum pedido vinculado encontrado.</p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function ContaCorrenteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { nCodCC } = params as { nCodCC: string };
  const { fetchContaByCodCC, loading } = useContasCorrentesStore();
  const [conta, setConta] = useState<ContaCorrente | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadConta() {
      if (nCodCC) {
        const codInt = parseInt(nCodCC);
        if (isNaN(codInt)) {
          setNotFound(true);
          return;
        }
        const found = await fetchContaByCodCC(codInt);
        if (found) {
          setConta(found);
        } else {
          setNotFound(true);
        }
      }
    }
    loadConta();
  }, [nCodCC, fetchContaByCodCC]);

  // Hook must be called at the top level
  const { data: vendasData } = useVendasQuery(
    1, 
    10, 
    '', 
    [], 
    [], 
    { contaCorrenteId: conta?.nCodCC }, 
    !!conta
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (loading && !conta) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono animate-pulse">Buscando detalhes da conta...</p>
      </div>
    );
  }

  if (notFound || (!loading && !conta)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Conta não encontrada</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Não foi possível localizar os detalhes da conta corrente solicitada.
        </p>
        <button 
          onClick={() => router.push('/contas-correntes')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Contas
        </button>
      </div>
    );
  }

  if (!conta) return null;

  const totalVendasCount = vendasData?.totalRegistros || 0;
  const totalVolume = (vendasData?.vendas || []).reduce((acc: number, curr: any) => acc + curr.valorTotal, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/contas-correntes')}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{conta.descricao}</h1>
            <div className="flex items-center gap-2">
               {conta.inativo === 'S' ? (
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
            Tipo: {conta.tipo_conta_corrente} · Banco: {conta.codigo_banco || '--'} · Omie ID: {conta.nCodCC}
          </p>
        </div>
      </div>

       {/* ═══ STAT CARDS ═══ */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          iconBg="bg-emerald-600"
          label="Saldo Inicial"
          value={formatCurrency(conta.saldo_inicial)}
          subValue="Conforme cadastro"
        />
        <StatCard
          icon={ShoppingCart}
          iconBg="bg-blue-600"
          label="Total Vendas"
          value={totalVendasCount.toString()}
          subValue="Pedidos vinculados"
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-indigo-600"
          label="Volume Vendas"
          value={formatCurrency(totalVolume)}
          subValue="Volume total"
        />
        <StatCard
          icon={CreditCard}
          iconBg="bg-zinc-600"
          label="Tipo Conta"
          value={conta.tipo}
          subValue={conta.tipo_conta_corrente}
        />
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── IDENTIFICAÇÃO ── */}
          <SectionCard icon={Info} iconColor="text-blue-500" title="Dados da Conta Corrente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Descrição" value={conta.descricao} className="text-white font-bold" large />
              <DataField label="Tipo de Conta" value={conta.tipo_conta_corrente} />
              <DataField label="Código do Banco" value={conta.codigo_banco} />
              <DataField label="Agência" value={conta.codigo_agencia} />
              <DataField label="Número da Conta" value={conta.numero_conta_corrente} className="font-mono text-indigo-400" />
            </div>
          </SectionCard>

          {/* ── ATIVIDADE RECENTE ── */}
          <RecentOrdersSection contaCorrenteId={conta.nCodCC} />
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">
          
          {/* ── STATUS SISTEMA ── */}
          <SectionCard icon={Database} iconColor="text-zinc-600" title="Informações Técnicas">
             <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Situação ERP</span>
                  <div className="flex items-center gap-2 mt-1">
                    {conta.inativo === 'S' ? (
                       <>
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-sm font-bold text-rose-400">Inativa</span>
                       </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm font-bold text-emerald-400">Ativa / Operacional</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                   <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Código Integração</span>
                   <code className="text-xs text-indigo-400 font-mono">{conta.codigo_integracao || '--'}</code>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                   <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Última Atualização Omie</span>
                   <span className="text-xs text-zinc-400">{conta.omie_updated_at ? new Date(conta.omie_updated_at).toLocaleString('pt-BR') : '--'}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                   <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Omie ID (PK)</span>
                   <code className="text-xs text-blue-400 font-mono">{conta.nCodCC}</code>
                </div>
             </div>
          </SectionCard>

          {/* ── CONFIGURAÇÕES ── */}
          <SectionCard icon={ShieldCheck} iconColor="text-zinc-500" title="Configurações">
             <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Enviar para PDV</span>
                  {conta.pdv_enviar === 'S' ? <CheckCircle2 className="text-emerald-500" size={14} /> : <Ban className="text-rose-500" size={14} />}
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-xs text-zinc-400">Saldo Inicial</span>
                  <span className="text-xs font-bold text-white">{formatCurrency(conta.saldo_inicial)}</span>
                </div>
             </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
