import NfTable from '@/components/NfTable';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-indigo-600 p-8 shadow-2xl flex items-center justify-between">
        <div className="relative z-10 w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wide mb-4 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Conexão Ativa - Vendas
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Painel de Notas Fiscais</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Suas notas fiscais estão sendo sincronizadas em tempo real com a API do Omie.
            Consulte os status de faturamento e os dados mais recentes de vendas com segurança.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="w-32 h-32 absolute -right-8 -bottom-8 rounded-full bg-white/10 blur-3xl"></div>
        <div className="w-24 h-24 absolute right-16 top-0 rounded-full bg-blue-400/30 blur-2xl"></div>
      </div>

      {/* Invoices Table Component */}
      <NfTable />
      
    </div>
  );
}
