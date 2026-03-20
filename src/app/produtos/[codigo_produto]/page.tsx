'use client';

import React, { useEffect, useState } from 'react';
import { useProdutosStore, Produto } from '@/store/useProdutosStore';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, Tag, Hash, 
  AlertCircle, RefreshCw, Database, 
  Info, BarChart3, Scale, 
  ShieldCheck, DollarSign, Box,
  ClipboardList, ShoppingCart
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

export default function ProdutoDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { codigo_produto } = params as { codigo_produto: string };
  const { fetchProdutoByOmieId, loading } = useProdutosStore();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  useEffect(() => {
    async function loadProduto() {
      if (codigo_produto) {
        const omieId = parseInt(codigo_produto);
        if (isNaN(omieId)) {
          setNotFound(true);
          return;
        }
        const found = await fetchProdutoByOmieId(omieId);
        if (found) {
          setProduto(found);
        } else {
          setNotFound(true);
        }
      }
    }
    loadProduto();
  }, [codigo_produto, fetchProdutoByOmieId]);

  // ── Loading / Not Found ──

  if (loading && !produto) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono animate-pulse">Buscando detalhes do produto...</p>
      </div>
    );
  }

  if (notFound || (!loading && !produto)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Produto não encontrado</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Não foi possível localizar os detalhes do produto solicitado.
        </p>
        <button 
          onClick={() => router.push('/produtos')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Produtos
        </button>
      </div>
    );
  }

  if (!produto) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/produtos')}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{produto.descricao}</h1>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${produto.excluido === 'N' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {produto.excluido === 'N' ? 'Ativo' : 'Excluído'}
            </span>
          </div>
          <p className="text-zinc-500 mt-1 text-sm">
            SKU/Cód: {produto.codigo || '--'} · Unidade: {produto.unidade} · Omie ID: {produto.codigo_produto}
          </p>
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          iconBg="bg-emerald-600"
          label="Preço Unitário"
          value={formatCurrency(produto.valor_unitario)}
        />
        <StatCard
          icon={Box}
          iconBg="bg-blue-600"
          label="Unidade"
          value={produto.unidade}
        />
        <StatCard
          icon={Hash}
          iconBg="bg-indigo-600"
          label="Código SKU"
          value={produto.codigo || '--'}
        />
        <StatCard
          icon={ShieldCheck}
          iconBg="bg-violet-600"
          label="NCM"
          value={produto.ncm || '--'}
        />
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── IDENTIFICAÇÃO DO PRODUTO ── */}
          <SectionCard icon={Package} iconColor="text-blue-500" title="Identificação do Produto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Descrição" value={produto.descricao} className="text-white font-bold" large />
              <DataField label="EAN / Código de Barras" value={produto.ean} className="font-mono text-zinc-400" />
              <DataField label="Família de Produto" value={produto.familia_produto} />
              <DataField label="Código SKU / Interno" value={produto.codigo} className="font-mono text-zinc-400" />
              <DataField label="Unidade de Medida" value={produto.unidade} />
              <DataField label="NCM" value={produto.ncm} />
            </div>
          </SectionCard>

          {/* ── LOGÍSTICA ── */}
          <SectionCard icon={Box} iconColor="text-orange-500" title="Informações Logísticas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Peso Bruto" value={produto.peso_bruto ? `${produto.peso_bruto} kg` : '--'} />
              <DataField label="Peso Líquido" value={produto.peso_liquido ? `${produto.peso_liquido} kg` : '--'} />
            </div>
          </SectionCard>

          {/* ── PREÇOS E COMERCIAL ── */}
          <SectionCard icon={DollarSign} iconColor="text-emerald-500" title="Preços e Comercial">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <DataField label="Preço de Venda" value={formatCurrency(produto.valor_unitario)} className="text-emerald-400 font-black text-xl" />
            </div>
          </SectionCard>

          {/* ── FISCAL ── */}
          <SectionCard icon={ShieldCheck} iconColor="text-rose-500" title="Dados Fiscais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="NCM" value={produto.ncm} />
            </div>
          </SectionCard>

        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">
          
          {/* ── INFORMAÇÕES ADICIONAIS ── */}
          <SectionCard icon={Info} iconColor="text-zinc-500" title="Status">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Situação Omie</span>
                <p className={`font-bold mt-1 ${produto.excluido === 'N' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {produto.excluido === 'N' ? 'Disponível / Ativo' : 'Excluído no ERP'}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* ── DADOS TÉCNICOS ── */}
          <SectionCard icon={Database} iconColor="text-zinc-600" title="Dados Técnicos">
             <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/50">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">ID Interno</span>
                  <code className="text-xs text-blue-400">{produto.codigo_produto}</code>
                </div>
             </div>
          </SectionCard>

        </div>
      </div>

    </div>
  );
}
