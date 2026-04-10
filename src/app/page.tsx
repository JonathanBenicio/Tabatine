import { LayoutDashboard, ShoppingBag, Banknote, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const cards = [
    {
      title: 'Fluxo de Vendas',
      description: 'Gerencie pedidos e notas fiscais de forma unificada.',
      icon: ShoppingBag,
      href: '/vendas',
      color: 'orange',
    },
    {
      title: 'Módulo Financeiro',
      description: 'Contas a pagar, receber e conciliação bancária.',
      icon: Banknote,
      href: '/financeiro/pagar',
      color: 'emerald',
    },
    {
      title: 'Base de Clientes',
      description: 'Cadastro completo e histórico de faturamento.',
      icon: Users,
      href: '/clientes',
      color: 'blue',
    },
    {
      title: 'Indicadores',
      description: 'Visão geral de desempenho e ticket médio.',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'purple',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 animate-in fade-in zoom-in duration-700">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-white/5 p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
            <Sparkles className="w-3 h-3" />
            Bem-vindo ao Tabatine
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Inteligência em <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Vendas</span> & Finanças.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10">
            Sua operação sincronizada em tempo real com o Omie ERP. 
            Uma interface premium para controle total de faturamento, pedidos e fluxo de caixa.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/10"
            >
              Ver Dashboard
            </Link>
            <Link 
              href="/vendas"
              className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl border border-white/10 hover:bg-zinc-800 transition-all active:scale-95"
            >
              Central de Vendas
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/4 right-20 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      </div>

      {/* Grid Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const colorStylesMap: Record<string, string> = {
            orange: 'group-hover:text-orange-400 bg-orange-500/10 border-orange-500/20',
            emerald: 'group-hover:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            blue: 'group-hover:text-blue-400 bg-blue-500/10 border-blue-500/20',
            purple: 'group-hover:text-purple-400 bg-purple-500/10 border-purple-500/20',
          };
          const colorStyles = colorStylesMap[card.color] || colorStylesMap.blue;

          return (
            <Link 
              key={card.title} 
              href={card.href}
              className="group p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-300 backdrop-blur-xl relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${colorStyles}`}>
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform">{card.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{card.description}</p>
              
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
