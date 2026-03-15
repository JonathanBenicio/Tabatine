'use client';

import React, { useEffect, useState } from 'react';
import { useVendasStore, VendaPlana } from '@/store/useVendasStore';
import { useLookupStore } from '@/store/useLookupStore';
import { useNfStore } from '@/store/useNfStore';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, User, Calendar, CreditCard, TrendingUp,
  AlertCircle, RefreshCw, Truck, FileText, Receipt,
  Hash, Scale, ClipboardList, Copy, Check,
  BarChart3, Percent, DollarSign, ShieldCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// ── Helpers ────────────────────────────────────────────────

const fmt = (val: number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const fmtDate = (dateStr: string | undefined) => {
  if (!dateStr || dateStr === '--') return '--';
  try {
    if (dateStr.includes('/')) return dateStr;
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
};

const fmtPerc = (val: number | undefined) => `${(val || 0).toFixed(2)}%`;

const fmtWeight = (val: number | undefined) => `${(val || 0).toFixed(3)} kg`;

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
      <span className={`text-sm font-medium text-right ml-4 ${className}`}>{value}</span>
    </div>
  );
}

function DataField({ label, value, className = 'text-zinc-300', large = false }: {
  label: string; value: React.ReactNode; className?: string; large?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{label}</span>
      <p className={`${large ? 'text-xl font-black' : 'font-medium'} ${className}`}>{value}</p>
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    AUTORIZADA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    EMITIDA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CANCELADA: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    DENEGADA: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PENDENTE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PAGO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const c = colors[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${c}`}>
      {status}
    </span>
  );
}

// ── Tax Table ────────────────────────────────────────────

function TaxRow({ name, color, data }: { name: string; color: string; data: { aliquota: number; base: number; valor: number; cst: string } }) {
  return (
    <div className={`p-4 rounded-xl border ${color} space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{name}</span>
        <span className="text-[10px] font-mono text-zinc-500">CST: {data.cst}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="text-[10px] text-zinc-500 block">Alíquota</span>
          <span className="text-sm font-bold text-zinc-300">{fmtPerc(data.aliquota)}</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 block">Base</span>
          <span className="text-sm font-bold text-zinc-300">{fmt(data.base)}</span>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 block">Valor</span>
          <span className="text-sm font-bold text-emerald-400">{fmt(data.valor)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function VendaDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id_linha } = params as { id_linha: string };
  const { vendas, fetchVendas, loading } = useVendasStore();
  const { 
    getClienteNome, getVendedorNome, getContaNome,
    fetchCliente, fetchVendedor, fetchConta 
  } = useLookupStore();
  const { nfs, fetchNfs } = useNfStore();
  const [venda, setVenda] = useState<VendaPlana | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);


  useEffect(() => {
    if (vendas.length === 0 && !loading) {
      fetchVendas(1);
    }
    if (nfs.length === 0) {
      fetchNfs(1);
    }
  }, [vendas.length, fetchVendas, loading, nfs.length, fetchNfs]);

  useEffect(() => {
    if (vendas.length > 0) {
      const found = vendas.find(v => v.id_linha === id_linha);
      if (found) {
        setVenda(found);
      } else {
        setNotFound(true);
      }
    }
  }, [vendas, id_linha]);

  useEffect(() => {
    if (venda) {
      if (venda.cliente && venda.cliente !== '--') fetchCliente(Number(venda.cliente));
      if (venda.codVendedor) fetchVendedor(venda.codVendedor);
      if (venda.codContaCorrente) fetchConta(venda.codContaCorrente);
    }
  }, [venda, fetchCliente, fetchVendedor, fetchConta]);

  const handleCopyKey = () => {
    if (venda?.chaveNfe) {
      navigator.clipboard.writeText(venda.chaveNfe);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // ── Loading / Not Found ──

  if (loading && !venda) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono animate-pulse">Buscando detalhes do pedido...</p>
      </div>
    );
  }

  if (notFound || (!loading && !venda && vendas.length > 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Venda não encontrada</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Não foi possível localizar os detalhes da venda solicitada. Ela pode ter sido removida ou o ID é inválido.
        </p>
        <button 
          onClick={() => router.push('/vendas')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Vendas
        </button>
      </div>
    );
  }

  if (!venda) return null;

  // ── Render ──

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/vendas')}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">Pedido #{venda.pedido}</h1>
            <StatusBadge status={venda.etapa} />
            <StatusBadge status={venda.statusNfe} />
          </div>
          <p className="text-zinc-500 mt-1 text-sm">
            Criado em {fmtDate(venda.dataPedido)} · Previsão {fmtDate(venda.dataPrevisao)} · {venda.qtdItens} {venda.qtdItens === 1 ? 'item' : 'itens'}
          </p>
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          iconBg="bg-emerald-600"
          label="Valor Total Pedido"
          value={fmt(venda.totalPedido.valorTotal || venda.valorTotal)}
        />
        <StatCard
          icon={Package}
          iconBg="bg-orange-600"
          label="Qtd. Itens"
          value={venda.qtdItens.toString()}
          subValue={`${venda.quantidade} ${venda.und}`}
        />
        <StatCard
          icon={Truck}
          iconBg="bg-blue-600"
          label="Frete"
          value={fmt(venda.freteDetalhado.valor)}
          subValue={venda.freteDetalhado.modalidade !== '--' ? venda.freteDetalhado.modalidade : undefined}
        />
        <StatCard
          icon={Percent}
          iconBg="bg-indigo-600"
          label="Desconto"
          value={fmtPerc(venda.percDesconto)}
          subValue={venda.valorDesconto > 0 ? fmt(venda.valorDesconto) : undefined}
        />
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── DETALHES DO PRODUTO ── */}
          <SectionCard icon={Package} iconColor="text-orange-500" title="Detalhes do Produto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DataField label="Código" value={venda.codigoProduto} />
              <DataField label="Descrição" value={venda.produto} className="text-white font-semibold" />
              <DataField label="NCM" value={venda.ncm} />
              <DataField label="CFOP" value={venda.cfop} />
              <DataField label="Unidade" value={venda.und} />
              <DataField label="Quantidade" value={venda.quantidade} />
              <DataField label="Valor Unitário" value={fmt(venda.valorVenda)} className="text-emerald-400" />
              <DataField label="Desconto" value={`${fmtPerc(venda.percDesconto)} (${fmt(venda.valorDesconto)})`} className="text-amber-400" />
              <DataField label="Valor Total Item" value={fmt(venda.valorTotal)} className="text-emerald-400" large />
            </div>
          </SectionCard>

          {/* ── IMPOSTOS ── */}
          <SectionCard icon={Receipt} iconColor="text-violet-500" title="Impostos">
            <div className="space-y-3">
              <TaxRow name="ICMS" color="bg-violet-500/5 border-violet-500/10" data={venda.impostos.icms} />
              <TaxRow name="PIS" color="bg-sky-500/5 border-sky-500/10" data={venda.impostos.pis} />
              <TaxRow name="COFINS" color="bg-teal-500/5 border-teal-500/10" data={venda.impostos.cofins} />
            </div>
            {venda.totalPedido.baseIcms > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Total ICMS do Pedido</span>
                <span className="text-sm font-bold text-violet-400">{fmt(venda.totalPedido.valorIcms)}</span>
              </div>
            )}
          </SectionCard>

          {/* ── FRETE & LOGÍSTICA ── */}
          <SectionCard icon={Truck} iconColor="text-blue-500" title="Frete & Logística">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DataField label="Modalidade" value={venda.freteDetalhado.modalidade} />
              <DataField label="Valor do Frete" value={fmt(venda.freteDetalhado.valor)} className="text-emerald-400" />
              <DataField label="Transportadora" value={venda.freteDetalhado.transportadora} />
              <DataField label="Peso Bruto" value={fmtWeight(venda.freteDetalhado.pesoBruto)} />
              <DataField label="Peso Líquido" value={fmtWeight(venda.freteDetalhado.pesoLiq)} />
              <DataField label="Volumes" value={venda.freteDetalhado.qtdVolumes.toString()} />
            </div>
            {venda.freteDetalhado.previsaoEntrega !== '--' && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                <span className="text-xs text-blue-400 font-bold">Previsão de Entrega</span>
                <span className="text-sm font-mono text-zinc-300">{fmtDate(venda.freteDetalhado.previsaoEntrega)}</span>
              </div>
            )}
          </SectionCard>

          {/* ── OBSERVAÇÕES ── */}
          {(venda.observacao || venda.observacaoInterna) && (
            <SectionCard icon={ClipboardList} iconColor="text-zinc-400" title="Observações">
              <div className="space-y-4">
                {venda.observacao && (
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">Observação da Venda</span>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{venda.observacao}</p>
                  </div>
                )}
                {venda.observacaoInterna && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <span className="text-[10px] uppercase font-bold text-amber-500/70 tracking-wider block mb-2">Observação Interna</span>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{venda.observacaoInterna}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">

          {/* ── CLIENTE & VENDEDOR ── */}
          <SectionCard icon={User} iconColor="text-blue-500" title="Envolvidos">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Cliente / Razão Social</span>
                <p className="text-white font-bold mt-1">
                  {getClienteNome(venda.cliente)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Vendedor</span>
                <p className="text-zinc-300 mt-1">
                  {getVendedorNome(venda.vendedor)}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <span className="text-sm font-bold text-indigo-400">Comissão</span>
                <span className="text-lg font-black text-indigo-300">{fmtPerc(venda.percComissao)}</span>
              </div>
            </div>
          </SectionCard>

          {/* ── FINANCEIRO ── */}
          <SectionCard icon={CreditCard} iconColor="text-emerald-500" title="Financeiro">
            <div className="space-y-0">
              <InfoRow label="Condição" value={venda.condPagto} className="text-white" />
              <InfoRow label="Forma" value={<span className="uppercase">{venda.formaPg}</span>} className="text-white" />
              <InfoRow label="Banco / Conta" value={
                <span className="max-w-[150px] truncate block text-right">
                  {getContaNome(venda.banco)}
                </span>
              } className="text-white" />
              <InfoRow label="Frete" value={fmt(venda.frete)} className="text-white" />
              <InfoRow label="Comissão Status" value={<StatusBadge status={venda.statusComissao} />} />
            </div>
          </SectionCard>

          {/* ── PARCELAS ── */}
          <SectionCard icon={Calendar} iconColor="text-amber-500" title={`Parcelas (${venda.todasParcelas.length})`}>
            <div className="space-y-3">
              {venda.todasParcelas.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">Nenhuma parcela registrada</p>
              ) : (
                venda.todasParcelas.map((parc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                          {parc.numero}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{fmtDate(parc.vencimento)}</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">{fmt(parc.valor)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                      {parc.percentual > 0 && <span>{fmtPerc(parc.percentual)}</span>}
                      {parc.meioPagamento && <span>· {parc.meioPagamento}</span>}
                      {parc.categoria && <span>· {parc.categoria}</span>}
                      {parc.nsu && <span>· NSU: {parc.nsu}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {/* ── NOTA FISCAL ── */}
          <SectionCard icon={FileText} iconColor="text-cyan-500" title="Nota Fiscal">
            <div className="space-y-0">
              <InfoRow 
                label="Número NF" 
                value={(nfs.find(n => n.id_pedido === venda?.omieData?.cabecalho?.codigo_pedido)?.numero_nf) || venda?.nf || 'Aguardando Emissão'} 
                className={((nfs.find(n => n.id_pedido === venda?.omieData?.cabecalho?.codigo_pedido)?.numero_nf) || venda?.nf) ? 'text-white font-bold' : 'text-zinc-500 italic'} 
              />
              <InfoRow label="Status" value={<StatusBadge status={venda.statusNfe} />} />
              <InfoRow label="Data Faturamento" value={fmtDate(venda.dataFaturamento)} />
              <InfoRow label="Data Inclusão" value={fmtDate(venda.dataInclusao)} />
              <InfoRow label="Data Alteração" value={fmtDate(venda.dataAlteracao)} />
            </div>
            {venda.chaveNfe && (
              <div className="mt-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">Chave de Acesso NFe</span>
                <button
                  onClick={handleCopyKey}
                  className="w-full p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/50 text-left flex items-center gap-2 hover:border-cyan-500/30 transition-colors group"
                >
                  <code className="text-[10px] text-cyan-400/80 font-mono break-all flex-1">
                    {venda.chaveNfe}
                  </code>
                  {copiedKey ? (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Copy size={14} className="text-zinc-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                  )}
                </button>
              </div>
            )}
          </SectionCard>

        </div>
      </div>



    </div>
  );
}
