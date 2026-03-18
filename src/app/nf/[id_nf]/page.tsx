'use client';

import React, { useEffect, useState } from 'react';
import { useNfStore, NfCadastroFlat } from '@/store/useNfStore';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Package, User, Calendar, CreditCard, TrendingUp,
  AlertCircle, RefreshCw, Database, Truck, FileText, Receipt,
  Hash, Scale, ClipboardList, Copy, Check, ChevronDown, ChevronUp,
  BarChart3, Percent, DollarSign, ShieldCheck, MapPin, Building2,
  Landmark, Info, ScrollText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// ── Helpers ────────────────────────────────────────────────

const fmt = (val: number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const fmtDate = (dateStr: string | undefined) => {
  if (!dateStr || dateStr === '--' || dateStr === '---') return '--';
  try {
    if (dateStr.includes('/')) return dateStr;
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
};

const fmtPerc = (val: number | undefined) => `${(val || 0).toFixed(2)}%`;

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

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  let colors = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  if (['faturado', 'autorizado', 'emitida', 'concluido'].includes(s)) {
    colors = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (['cancelado', 'cancelada', 'denegado', 'denegada'].includes(s)) {
    colors = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (['pendente'].includes(s)) {
    colors = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${colors}`}>
      {status || 'Pendente'}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function NfDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id_nf } = params as { id_nf: string };
  const { nfs, nfsMap, fetchNfs, loading } = useNfStore();
  const [nf, setNf] = useState<NfCadastroFlat | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);

  useEffect(() => {
    if (nfs.length === 0 && !loading) {
      fetchNfs(1);
    }
  }, [nfs.length, fetchNfs, loading]);

  useEffect(() => {
    if (nfs.length > 0) {
      const found = nfsMap[id_nf];
      if (found) {
        setNf(found);
      } else {
        setNotFound(true);
      }
    }
  }, [nfs, nfsMap, id_nf]);

  const handleCopyKey = () => {
    const chave = nf?.chave_nfe || raw?.compl?.cChaveNFe || raw?.info?.cChaveNFe || '';
    if (chave) {
      navigator.clipboard.writeText(chave);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // ── Loading / Not Found ──

  if (loading && !nf) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono animate-pulse">Buscando detalhes da nota fiscal...</p>
      </div>
    );
  }

  if (notFound || (!loading && !nf && nfs.length > 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Nota Fiscal não encontrada</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Não foi possível localizar os detalhes da NF solicitada. Ela pode ter sido removida ou o ID é inválido.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Notas Fiscais
        </button>
      </div>
    );
  }

  if (!nf) return null;

  // ── Extract raw data sections ──
  const raw = nf.omieData || {};
  const ide = raw.ide || {};
  const dest = raw.nfDestInt || raw.destinatario || {};
  const info = raw.info || {};
  const total = raw.total || {};
  const icmsTot = total.ICMSTot || {};
  const issqnTot = total.ISSQNtot || {};
  const compl = raw.compl || {};
  const detArray = raw.det || raw.detArray || [];
  const titulosArray = raw.titulos || raw.titulosArray || [];
  const pedido = raw.pedido || {};

  const chaveNfe = nf.chave_nfe || compl.cChaveNFe || info.cChaveNFe || ide.cChaveNFe || '';

  // ── Render ──

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/')}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">NF-e #{nf.numero_nf}</h1>
            <StatusBadge status={nf.status_nf} />
          </div>
          <p className="text-zinc-500 mt-1 text-sm">
            Emissão {fmtDate(nf.data_emissao)} · Série {nf.serie} · Modelo {nf.modelo}
            {nf.natureza_operacao !== '---' && ` · ${nf.natureza_operacao}`}
          </p>
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          iconBg="bg-emerald-600"
          label="Valor Total NF"
          value={fmt(nf.valor_total_nf)}
        />
        <StatCard
          icon={Package}
          iconBg="bg-orange-600"
          label="Itens"
          value={detArray.length.toString()}
          subValue={detArray.length === 1 ? '1 produto' : `${detArray.length} produtos`}
        />
        <StatCard
          icon={CreditCard}
          iconBg="bg-blue-600"
          label="Títulos"
          value={titulosArray.length.toString()}
          subValue={titulosArray.length === 1 ? '1 parcela' : `${titulosArray.length} parcelas`}
        />
        <StatCard
          icon={ShieldCheck}
          iconBg="bg-violet-600"
          label="Status Fiscal"
          value={nf.status_nf}
        />
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── IDENTIFICAÇÃO DA NF ── */}
          <SectionCard icon={FileText} iconColor="text-blue-500" title="Identificação da NF">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DataField label="ID Omie" value={nf.id_nf?.toString()} />
              <DataField label="Número NF" value={nf.numero_nf} className="text-white font-semibold" />
              <DataField label="Série" value={nf.serie} />
              <DataField label="Modelo" value={nf.modelo} />
              <DataField label="Data Emissão" value={fmtDate(nf.data_emissao)} />
              <DataField label="Natureza Operação" value={nf.natureza_operacao} />
              <DataField label="Tipo Operação" value={ide.cTipoNF || ide.tpNF || '--'} />
              <DataField label="Finalidade" value={ide.cFinalidade || ide.finNFe || '--'} />
              <DataField label="Ambiente" value={ide.cAmbiente === '1' ? 'Produção' : ide.cAmbiente === '2' ? 'Homologação' : (ide.cAmbiente || '--')} />
            </div>
          </SectionCard>

          {/* ── ITENS / PRODUTOS ── */}
          <SectionCard icon={Package} iconColor="text-orange-500" title={`Itens da Nota (${detArray.length})`}>
            {detArray.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">Nenhum item disponível nesta NF</p>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">#</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Código</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Descrição</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">NCM</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">CFOP</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Unid.</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Qtd</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">V. Unit.</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">V. Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {detArray.map((item: any, idx: number) => {
                      const prod = item.prod || {};
                      const itemPed = item.itemPedido || {};
                      return (
                        <tr key={idx} className="hover:bg-zinc-800/10 transition-colors">
                          <td className="py-3 px-6 text-xs text-zinc-500 font-mono">{idx + 1}</td>
                          <td className="py-3 px-6 text-xs text-zinc-400 font-mono">{prod.cCodigo || prod.cProd || '--'}</td>
                          <td className="py-3 px-6 text-sm text-zinc-300 font-medium max-w-[200px] truncate">{prod.cDescricao || prod.xProd || '--'}</td>
                          <td className="py-3 px-6 text-xs text-zinc-400 font-mono">{prod.cNCM || prod.NCM || '--'}</td>
                          <td className="py-3 px-6 text-xs text-zinc-400 font-mono">{prod.cCFOP || prod.CFOP || '--'}</td>
                          <td className="py-3 px-6 text-xs text-zinc-400">{prod.cUnidade || prod.uCom || '--'}</td>
                          <td className="py-3 px-6 text-xs text-zinc-300 font-mono text-right">{prod.nQuantidade || prod.qCom || 0}</td>
                          <td className="py-3 px-6 text-xs text-zinc-300 text-right">{fmt(prod.nValorUnitario || prod.vUnCom || 0)}</td>
                          <td className="py-3 px-6 text-sm font-bold text-emerald-400 text-right">{fmt(prod.nValorTotal || prod.vProd || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-zinc-700/50 bg-zinc-900/30">
                      <td colSpan={8} className="py-3 px-6 text-xs font-bold text-zinc-400 text-right">Total dos Itens</td>
                      <td className="py-3 px-6 text-sm font-black text-emerald-400 text-right">
                        {fmt(detArray.reduce((sum: number, item: any) => sum + (item.prod?.nValorTotal || item.prod?.vProd || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </SectionCard>

          {/* ── TOTAIS & IMPOSTOS ── */}
          <SectionCard icon={Receipt} iconColor="text-violet-500" title="Totais & Impostos">
            <div className="space-y-4">
              {/* Valor total NF */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400">Valor Total da NF</span>
                <span className="text-xl font-black text-emerald-400">{fmt(nf.valor_total_nf)}</span>
              </div>

              {/* ICMS Total */}
              {(icmsTot.vBC > 0 || icmsTot.vICMS > 0 || icmsTot.vNF > 0) && (
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 space-y-3">
                  <span className="text-sm font-bold text-violet-400 block">ICMS Total</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DataField label="Base de Cálculo" value={fmt(icmsTot.vBC)} className="text-zinc-300" />
                    <DataField label="Valor ICMS" value={fmt(icmsTot.vICMS)} className="text-violet-400" />
                    <DataField label="Valor NF" value={fmt(icmsTot.vNF || nf.valor_total_nf)} className="text-white" />
                    <DataField label="Valor Produtos" value={fmt(icmsTot.vProd)} className="text-zinc-300" />
                    <DataField label="Valor IPI" value={fmt(icmsTot.vIPI)} className="text-orange-400" />
                    <DataField label="PIS" value={fmt(icmsTot.vPIS)} className="text-sky-400" />
                    <DataField label="COFINS" value={fmt(icmsTot.vCOFINS)} className="text-teal-400" />
                    <DataField label="Valor Frete" value={fmt(icmsTot.vFrete)} className="text-zinc-300" />
                    <DataField label="Valor Desconto" value={fmt(icmsTot.vDesc)} className="text-amber-400" />
                    <DataField label="Valor Seguro" value={fmt(icmsTot.vSeg)} className="text-zinc-300" />
                    <DataField label="Outras Despesas" value={fmt(icmsTot.vOutro)} className="text-zinc-300" />
                    <DataField label="ICMS Desonerado" value={fmt(icmsTot.vICMSDeson)} className="text-zinc-400" />
                  </div>
                </div>
              )}

              {/* ISSQN Total */}
              {(issqnTot.vISS > 0 || issqnTot.vBC > 0) && (
                <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/10 space-y-3">
                  <span className="text-sm font-bold text-sky-400 block">ISSQN Total</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DataField label="Base de Cálculo" value={fmt(issqnTot.vBC)} className="text-zinc-300" />
                    <DataField label="Valor ISS" value={fmt(issqnTot.vISS)} className="text-sky-400" />
                    <DataField label="Valor Serviços" value={fmt(issqnTot.vServ)} className="text-zinc-300" />
                  </div>
                </div>
              )}

              {/* If no tax data at all */}
              {!icmsTot.vBC && !icmsTot.vICMS && !icmsTot.vNF && !issqnTot.vISS && (
                <p className="text-sm text-zinc-500 italic">Dados de impostos não disponíveis para esta NF</p>
              )}
            </div>
          </SectionCard>

          {/* ── TÍTULOS / PARCELAS ── */}
          <SectionCard icon={Calendar} iconColor="text-amber-500" title={`Títulos / Parcelas (${titulosArray.length})`}>
            {titulosArray.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">Nenhum título registrado para esta NF</p>
            ) : (
              <div className="space-y-3">
                {titulosArray.map((titulo: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                          {titulo.nNumeroTitulo || titulo.numero_parcela || idx + 1}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          Venc: {fmtDate(titulo.dDataVencimento || titulo.data_vencimento || '')}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">
                        {fmt(titulo.nValorTitulo || titulo.valor || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 flex-wrap">
                      {titulo.cNumBancario && <span>Nº Bancário: {titulo.cNumBancario}</span>}
                      {titulo.cCodCateg && <span>· Cat: {titulo.cCodCateg}</span>}
                      {titulo.nPercentual > 0 && <span>· {fmtPerc(titulo.nPercentual)}</span>}
                      {titulo.meio_pagamento && <span>· {titulo.meio_pagamento}</span>}
                      {titulo.nsu && <span>· NSU: {titulo.nsu}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── DADOS COMPLEMENTARES ── */}
          {(compl.xNatureza || compl.cInfCpl || compl.cInfAdFisco) && (
            <SectionCard icon={ClipboardList} iconColor="text-zinc-400" title="Dados Complementares">
              <div className="space-y-4">
                {compl.xNatureza && (
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">Natureza da Operação</span>
                    <p className="text-sm text-zinc-300">{compl.xNatureza}</p>
                  </div>
                )}
                {compl.cInfCpl && (
                  <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">Informações Complementares</span>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{compl.cInfCpl}</p>
                  </div>
                )}
                {compl.cInfAdFisco && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <span className="text-[10px] uppercase font-bold text-amber-500/70 tracking-wider block mb-2">Informações Adicionais de Interesse do Fisco</span>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{compl.cInfAdFisco}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">

          {/* ── DESTINATÁRIO ── */}
          <SectionCard icon={User} iconColor="text-blue-500" title="Destinatário">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Razão Social</span>
                <p className="text-white font-bold mt-1">{nf.razao_social}</p>
              </div>
              <div className="space-y-0">
                <InfoRow label="CNPJ / CPF" value={nf.cnpj_cpf} className="text-white font-mono" />
                {(dest.sInscEstadual || dest.cIE) && <InfoRow label="Inscrição Estadual" value={dest.sInscEstadual || dest.cIE} />}
                {(dest.sEmail || dest.email) && <InfoRow label="E-mail" value={dest.sEmail || dest.email} />}
                {(dest.sTelefone || dest.fone) && <InfoRow label="Telefone" value={dest.sTelefone || dest.fone} />}
              </div>
              {/* Address */}
              {(dest.sEndereco || dest.sCidade || dest.endereco || dest.cidade) && (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-blue-400" />
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Endereço</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {[
                      dest.sEndereco || dest.endereco,
                      (dest.sNumero || dest.numero) && `nº ${dest.sNumero || dest.numero}`,
                      dest.sComplemento || dest.complemento,
                      dest.sBairro || dest.bairro,
                      (dest.sCidade || dest.cidade) && (dest.sUF || dest.uf) ? `${dest.sCidade || dest.cidade} - ${dest.sUF || dest.uf}` : (dest.sCidade || dest.cidade || dest.sUF || dest.uf),
                      (dest.sCEP || dest.cep) && `CEP: ${dest.sCEP || dest.cep}`,
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── INFORMAÇÕES DO SISTEMA ── */}
          <SectionCard icon={Info} iconColor="text-cyan-500" title="Informações do Sistema">
            <div className="space-y-0">
              <InfoRow label="Cód. Interno NF" value={info.nCodNF?.toString() || nf.id_nf?.toString() || '--'} />
              <InfoRow label="Valor NF" value={fmt(info.nValorNF || nf.valor_total_nf)} className="text-emerald-400 font-bold" />
              {info.dInclusao && <InfoRow label="Data Inclusão" value={fmtDate(info.dInclusao)} />}
              {info.hInclusao && <InfoRow label="Hora Inclusão" value={info.hInclusao} />}
              {info.dAlteracao && <InfoRow label="Data Alteração" value={fmtDate(info.dAlteracao)} />}
              {info.hAlteracao && <InfoRow label="Hora Alteração" value={info.hAlteracao} />}
              {info.cImpresso && <InfoRow label="Impresso" value={info.cImpresso === 'S' ? 'Sim' : 'Não'} />}
              {info.cCancelado && <InfoRow label="Cancelada" value={info.cCancelado === 'S' ? 'Sim' : 'Não'} className={info.cCancelado === 'S' ? 'text-rose-400' : 'text-zinc-300'} />}
              {info.cDenegado && <InfoRow label="Denegada" value={info.cDenegado === 'S' ? 'Sim' : 'Não'} className={info.cDenegado === 'S' ? 'text-rose-400' : 'text-zinc-300'} />}
            </div>
          </SectionCard>

          {/* ── PEDIDO VINCULADO ── */}
          {(pedido.nCodPedido || pedido.cNumeroPedido) && (
            <SectionCard icon={ScrollText} iconColor="text-indigo-500" title="Pedido Vinculado">
              <div className="space-y-0">
                <InfoRow label="Cód. Pedido" value={pedido.nCodPedido?.toString() || '--'} />
                <InfoRow label="Nº Pedido" value={pedido.cNumeroPedido || '--'} className="text-white font-bold" />
                {pedido.cEtapa && <InfoRow label="Etapa" value={<StatusBadge status={pedido.cEtapa} />} />}
                {pedido.dDataPedido && <InfoRow label="Data Pedido" value={fmtDate(pedido.dDataPedido)} />}
                {pedido.dDataPrevisao && <InfoRow label="Previsão" value={fmtDate(pedido.dDataPrevisao)} />}
                {pedido.cCodCateg && <InfoRow label="Categoria" value={pedido.cCodCateg} />}
                {pedido.nCodCC && <InfoRow label="Conta Corrente" value={pedido.nCodCC?.toString()} />}
                {pedido.cCodVend && <InfoRow label="Vendedor" value={pedido.cCodVend?.toString()} />}
                {pedido.nValorTotalPedido > 0 && <InfoRow label="Valor Total" value={fmt(pedido.nValorTotalPedido)} className="text-emerald-400" />}
              </div>
            </SectionCard>
          )}

          {/* ── CHAVE NFe ── */}
          {chaveNfe && (
            <SectionCard icon={ShieldCheck} iconColor="text-cyan-500" title="Chave de Acesso NFe">
              <button
                onClick={handleCopyKey}
                className="w-full p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/50 text-left flex items-center gap-2 hover:border-cyan-500/30 transition-colors group"
              >
                <code className="text-[10px] text-cyan-400/80 font-mono break-all flex-1">
                  {chaveNfe}
                </code>
                {copiedKey ? (
                  <Check size={14} className="text-emerald-400 shrink-0" />
                ) : (
                  <Copy size={14} className="text-zinc-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                )}
              </button>
            </SectionCard>
          )}

        </div>
      </div>

      {/* ═══ DADOS BRUTOS (Collapsible) ═══ */}
      {nf.omieData && (
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl">
          <button
            onClick={() => setRawOpen(!rawOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="text-zinc-400" size={20} />
              Dados Brutos (Integração Omie)
            </h2>
            {rawOpen ? (
              <ChevronUp className="text-zinc-500" size={20} />
            ) : (
              <ChevronDown className="text-zinc-500" size={20} />
            )}
          </button>
          {rawOpen && (
            <div className="mt-6 bg-zinc-950/80 rounded-xl border border-zinc-800/50 p-4 overflow-x-auto animate-in fade-in slide-in-from-top-2 duration-300">
              <pre className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                {JSON.stringify(nf.omieData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
