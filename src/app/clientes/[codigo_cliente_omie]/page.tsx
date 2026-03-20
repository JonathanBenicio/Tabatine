'use client';

import React, { useEffect, useState } from 'react';
import { useClienteStore, ClienteCadastro } from '@/store/useClienteStore';
import { useVendasQuery } from '@/hooks/useVendasQuery';
import { useNfQuery } from '@/hooks/useNfQuery';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, User, MapPin, Mail, Phone,
  AlertCircle, RefreshCw, Database, 
  Info, Building2, Tag, Calendar,
  ShieldCheck, Globe, Hash, Clock,
  ShoppingCart, Receipt
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

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

function RecentOrdersSection({ clienteOmieId }: { clienteOmieId: number }) {
  const { data, isLoading } = useVendasQuery(1, 'all', '', { clienteOmieId });
  const router = useRouter();
  const orders = data?.vendas?.slice(0, 5) || [];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl h-full">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <ShoppingCart className="text-emerald-500" size={16} />
        Últimos Pedidos
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
                <p className="text-xs font-bold text-emerald-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.valorTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic py-4">Nenhum pedido encontrado.</p>
      )}
    </div>
  );
}

function RecentInvoicesSection({ clienteOmieId }: { clienteOmieId: number }) {
  const { data, isLoading } = useNfQuery(1, '', { clienteOmieId });
  const router = useRouter();
  const nfs = data?.nfs?.slice(0, 5) || [];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl h-full">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Receipt className="text-blue-500" size={16} />
        Últimas Notas Fiscais
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />)}
        </div>
      ) : nfs.length > 0 ? (
        <div className="space-y-2">
          {nfs.map((nf: any) => (
            <div 
              key={nf.id_nf}
              onClick={() => router.push(`/nf?search=${nf.numero_nf}`)}
              className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer flex justify-between items-center group"
            >
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  NF {nf.numero_nf}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    nf.status_nf === 'Autorizado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    nf.status_nf === 'Cancelado' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                    'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}>
                    {nf.status_nf}
                  </span>
                </p>
                <p className="text-[10px] text-zinc-500">{nf.data_emissao}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-blue-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nf.valor_total_nf)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic py-4">Nenhuma nota fiscal encontrada.</p>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function ClienteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { codigo_cliente_omie } = params as { codigo_cliente_omie: string };
  const { clientes, fetchClientes, loading } = useClienteStore();
  const [cliente, setCliente] = useState<ClienteCadastro | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (clientes.length === 0 && !loading) {
      fetchClientes(1);
    }
  }, [clientes.length, fetchClientes, loading]);

  useEffect(() => {
    if (clientes.length > 0) {
      const found = clientes.find(c => c.codigo_cliente_omie.toString() === codigo_cliente_omie);
      if (found) {
        setCliente(found);
      } else {
        setNotFound(true);
      }
    }
  }, [clientes, codigo_cliente_omie]);

  if (loading && !cliente) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-vh-[50vh]">
        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono animate-pulse">Buscando detalhes do cliente...</p>
      </div>
    );
  }

  if (notFound || (!loading && !cliente && clientes.length > 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-white mb-2">Cliente não encontrado</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Não foi possível localizar os detalhes do cliente solicitado.
        </p>
        <button 
          onClick={() => router.push('/clientes')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Clientes
        </button>
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.push('/clientes')}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-white">{cliente.razao_social}</h1>
            {cliente.inativo === 'S' && (
              <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-rose-500/10 text-rose-400 border-rose-500/20">
                Inativo
              </span>
            )}
          </div>
          <p className="text-zinc-500 mt-1 text-sm">
            {cliente.nome_fantasia && cliente.nome_fantasia !== cliente.razao_social ? `${cliente.nome_fantasia} · ` : ''} 
            CNPJ/CPF: {cliente.cnpj_cpf} · Omie ID: {cliente.codigo_cliente_omie}
          </p>
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── IDENTIFICAÇÃO ── */}
          <SectionCard icon={Info} iconColor="text-indigo-500" title="Informações Gerais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Razão Social" value={cliente.razao_social} className="text-white font-bold" />
              <DataField label="Nome Fantasia" value={cliente.nome_fantasia} />
              <DataField label="CNPJ / CPF" value={cliente.cnpj_cpf} />
              <DataField label="Código Integração" value={cliente.codigo_cliente_integracao} />
              <DataField label="Tipo Pessoa" value={cliente.cnpj_cpf?.length > 14 ? 'Jurídica' : 'Física'} />
            </div>
          </SectionCard>

          {/* ── LOCALIZAÇÃO ── */}
          <SectionCard icon={MapPin} iconColor="text-blue-500" title="Localização">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Logradouro" value={cliente.endereco} />
              <DataField label="Número" value={cliente.endereco_numero} />
              <DataField label="Complemento" value={cliente.endereco_complemento} />
              <DataField label="Bairro" value={cliente.bairro} />
              <DataField label="Cidade" value={cliente.cidade} />
              <DataField label="Estado" value={cliente.estado} />
            </div>
          </SectionCard>

          {/* ── CONTATO ── */}
          <SectionCard icon={Phone} iconColor="text-emerald-500" title="Contato">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="E-mail" value={cliente.email} className="text-indigo-400 font-medium" />
              <DataField label="Telefone" value={cliente.telefone1_ddd && cliente.telefone1_numero ? `(${cliente.telefone1_ddd}) ${cliente.telefone1_numero}` : '--'} />
              <DataField label="WhatsApp / Celular" value={cliente.telefone2_ddd && cliente.telefone2_numero ? `(${cliente.telefone2_ddd}) ${cliente.telefone2_numero}` : '--'} />
              <DataField label="Website" value={cliente.homepage} />
            </div>
          </SectionCard>

          {/* ── FISCAL ── */}
          <SectionCard icon={ShieldCheck} iconColor="text-rose-500" title="Identificação Fiscal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label="Inscrição Estadual" value={cliente.inscricao_estadual} />
              <DataField label="Inscrição Municipal" value={cliente.inscricao_municipal} />
              <DataField label="Optante Simples Nacional" value={cliente.optante_simples_nacional ? 'Sim' : 'Não'} />
            </div>
          </SectionCard>

          {/* ── ATIVIDADE RECENTE ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <RecentOrdersSection clienteOmieId={cliente.codigo_cliente_omie} />
             <RecentInvoicesSection clienteOmieId={cliente.codigo_cliente_omie} />
          </div>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">
          
          {/* ── TAGS ── */}
          <SectionCard icon={Tag} iconColor="text-amber-500" title="Tags e Categorias">
            <div className="flex flex-wrap gap-2">
              {cliente.tags && cliente.tags.length > 0 ? (
                cliente.tags.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {t.tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-zinc-500 italic">Nenhuma tag associada</p>
              )}
            </div>
          </SectionCard>

          {/* ── AUDITORIA ── */}
          <SectionCard icon={Clock} iconColor="text-zinc-500" title="Auditoria">
            <div className="space-y-0">
              <InfoRow label="ID Interno Omie" value={cliente.codigo_cliente_omie} className="font-mono text-indigo-400" />
              <InfoRow label="Integrado em" value={cliente.info?.dInclusao ? `${cliente.info.dInclusao} ${cliente.info.hInclusao}` : '--'} />
              <InfoRow label="Última Alteração" value={cliente.info?.dAlteracao ? `${cliente.info.dAlteracao} ${cliente.info.hAlteracao}` : '--'} />
            </div>
          </SectionCard>

          {/* ── DADOS TÉCNICOS ── */}
          <SectionCard icon={Database} iconColor="text-zinc-600" title="Sistema">
             <div className="space-y-4">
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Código Integração</span>
                  <code className="text-xs text-zinc-400">{cliente.codigo_cliente_integracao || 'N/A'}</code>
                </div>
             </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
