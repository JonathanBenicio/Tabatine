'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  Users, 
  TrendingUp,
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ArrowRight,
  Banknote,
  Package
} from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl flex flex-col hidden md:flex">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-zinc-800/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="ml-3 font-bold text-lg tracking-tight">Omie <span className="text-zinc-500 font-medium">Connect</span></span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Menu Principal</p>
          
          <Link href="/dashboard" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/dashboard' ? 'bg-purple-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/dashboard' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-md"></div>}
            <LayoutDashboard className={`w-5 h-5 mr-3 ${pathname === '/dashboard' ? 'text-purple-400' : 'group-hover:text-purple-400 transition-colors'}`} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link href="/" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
            <FileText className={`w-5 h-5 mr-3 ${pathname === '/' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
            <span className="text-sm font-medium">Notas Fiscais</span>
          </Link>

          <Link href="/vendas" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/vendas' ? 'bg-orange-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/vendas' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-md"></div>}
            <TrendingUp className={`w-5 h-5 mr-3 ${pathname === '/vendas' ? 'text-orange-400' : 'group-hover:text-orange-400 transition-colors'}`} />
            <span className="text-sm font-medium">Relatório Vendas</span>
            <span className="ml-auto px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] uppercase font-bold">Novo</span>
          </Link>

          <Link href="/notificacoes" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/notificacoes' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/notificacoes' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
            <Bell className={`w-5 h-5 mr-3 ${pathname === '/notificacoes' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
            <span className="text-sm font-medium">Notificações</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>
          </Link>

          <Link href="/clientes" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/clientes' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/clientes' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
            <Users className={`w-5 h-5 mr-3 ${pathname === '/clientes' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
            <span className="text-sm font-medium">Clientes</span>
          </Link>

          <Link href="/vendedores" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/vendedores' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/vendedores' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
            <ArrowRight className={`w-5 h-5 mr-3 ${pathname === '/vendedores' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
            <span className="text-sm font-medium">Vendedores</span>
          </Link>
          
          <Link href="/produtos" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/produtos' ? 'bg-indigo-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/produtos' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md"></div>}
            <Package className={`w-5 h-5 mr-3 ${pathname === '/produtos' ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`} />
            <span className="text-sm font-medium">Produtos</span>
          </Link>

          <Link href="/conciliacao" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/conciliacao' ? 'bg-emerald-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/conciliacao' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md"></div>}
            <Banknote className={`w-5 h-5 mr-3 ${pathname === '/conciliacao' ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'}`} />
            <span className="text-sm font-medium">Conciliação</span>
          </Link>

          <Link href="/contas-correntes" className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/contas-correntes' ? 'bg-emerald-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {pathname === '/contas-correntes' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md"></div>}
            <Building2 className={`w-5 h-5 mr-3 ${pathname === '/contas-correntes' ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'}`} />
            <span className="text-sm font-medium">Bancos</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          <Link href="#" className="flex items-center px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all group">
            <Settings className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>
          <Link href="#" className="flex items-center px-3 py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all group">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Sair</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Pesquisar em toda plataforma..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-zinc-300 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-zinc-900"></span>
            </button>
            
            <div className="h-8 w-px bg-zinc-800"></div>

            <button className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Administrador</p>
                <p className="text-xs text-zinc-500">admin@empresa.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600 flex items-center justify-center p-0.5 relative">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=transparent" 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover bg-zinc-900"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900"></div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
