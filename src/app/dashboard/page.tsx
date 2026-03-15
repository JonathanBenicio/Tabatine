import DashboardCharts from '@/components/DashboardCharts';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 shadow-2xl flex items-center justify-between">
        <div className="relative z-10 w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wide mb-4 backdrop-blur-md">
            <LayoutDashboard className="w-3 h-3 text-purple-300" />
            Visão Geral
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard de Desempenho</h1>
          <p className="text-purple-100 text-sm leading-relaxed">
            Acompanhe o faturamento, ticket médio e a evolução das vendas agrupadas por semana.
            Os dados são sincronizados com a API para trazer insights valiosos.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        <div className="w-32 h-32 absolute -right-8 -bottom-8 rounded-full bg-white/10 blur-3xl"></div>
        <div className="w-24 h-24 absolute right-16 top-0 rounded-full bg-purple-400/30 blur-2xl"></div>
      </div>

      {/* Dashboard Data / Charts */}
      <DashboardCharts />
      
    </div>
  );
}
