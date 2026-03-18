import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VendasTable from '@/components/VendasTable';
import { TrendingUp } from 'lucide-react';

export default async function VendasPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-[100vw] mx-auto space-y-8 animate-in fade-in zoom-in duration-500 overflow-x-hidden">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-8 shadow-2xl flex items-center justify-between">
        <div className="relative z-10 w-full md:w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wide mb-4 backdrop-blur-md">
            <TrendingUp className="w-3 h-3 text-amber-300" />
            Módulo Financeiro e Vendas
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Relatório de Vendas</h1>
          <p className="text-orange-100 text-sm leading-relaxed max-w-2xl">
            Acompanhe a lista cruzada de produtos, clientes e parcelamentos gerados de seus pedidos do Omie.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay hidden md:block"></div>
        <div className="w-32 h-32 absolute -right-8 -bottom-8 rounded-full bg-white/10 blur-3xl hidden md:block"></div>
        <div className="w-24 h-24 absolute right-16 top-0 rounded-full bg-orange-400/30 blur-2xl hidden md:block"></div>
      </div>

      {/* Vendas Table Component */}
      <div className="w-[calc(100vw-2rem)] md:w-full overflow-hidden pb-8">
        <VendasTable />
      </div>
      
    </div>
  );
}
