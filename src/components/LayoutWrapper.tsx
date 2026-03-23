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
  Package,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fecha o menu mobile quando a rota muda
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Se a rota for de autenticação, não renderiza sidebar nem header
  if (pathname.startsWith('/auth') || pathname === '/reset-password') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out border-r border-zinc-800/50 bg-zinc-950/95 md:bg-zinc-950/50 backdrop-blur-xl flex flex-col fixed md:relative z-50 h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo Area */}
        <div className={`h-20 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-zinc-800/50 relative`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          {isMobileMenuOpen && (
            <button
              onClick={toggleMobileMenu}
              className="md:hidden absolute top-6 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          {!isSidebarCollapsed && (
            <span className="ml-3 font-bold text-lg tracking-tight truncate">Omie <span className="text-zinc-500 font-medium">Connect</span></span>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-800 rounded-full border border-zinc-700 items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors z-10"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {!isSidebarCollapsed && <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Menu Principal</p>}
          
          <Link
              href="/dashboard"
              title={isSidebarCollapsed ? "Dashboard" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/dashboard' ? 'bg-purple-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/dashboard' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-md"></div>}
              <LayoutDashboard className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/dashboard' ? 'text-purple-400' : 'group-hover:text-purple-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>

                </>
              )}
            </Link>
          
          <Link
              href="/"
              title={isSidebarCollapsed ? "Notas Fiscais" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
              <FileText className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Notas Fiscais</span>

                </>
              )}
            </Link>

          <Link
              href="/vendas"
              title={isSidebarCollapsed ? "Relatório Vendas" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/vendas' ? 'bg-orange-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/vendas' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-md"></div>}
              <TrendingUp className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/vendas' ? 'text-orange-400' : 'group-hover:text-orange-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Relatório Vendas</span>
                  <span className="ml-auto px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] uppercase font-bold">Novo</span>
                </>
              )}
            </Link>

          <Link
              href="/notificacoes"
              title={isSidebarCollapsed ? "Notificações" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/notificacoes' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/notificacoes' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
              <Bell className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/notificacoes' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Notificações</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>
                </>
              )}
            </Link>

          <Link
              href="/clientes"
              title={isSidebarCollapsed ? "Clientes" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/clientes' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/clientes' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
              <Users className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/clientes' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Clientes</span>

                </>
              )}
            </Link>

          <Link
              href="/vendedores"
              title={isSidebarCollapsed ? "Vendedores" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/vendedores' ? 'bg-blue-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/vendedores' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md"></div>}
              <ArrowRight className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/vendedores' ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Vendedores</span>

                </>
              )}
            </Link>
          
          <Link
              href="/produtos"
              title={isSidebarCollapsed ? "Produtos" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/produtos' ? 'bg-indigo-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/produtos' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md"></div>}
              <Package className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/produtos' ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Produtos</span>

                </>
              )}
            </Link>

          <Link
              href="/conciliacao"
              title={isSidebarCollapsed ? "Conciliação" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/conciliacao' ? 'bg-emerald-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/conciliacao' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md"></div>}
              <Banknote className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${pathname === '/conciliacao' ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'}`} />
              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Conciliação</span>

                </>
              )}
            </Link>

          <Link
              href="/contas-correntes"
              title={isSidebarCollapsed ? "Bancos" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${pathname === '/contas-correntes' ? 'bg-emerald-500/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
              {pathname === '/contas-correntes' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-md"></div>}

              {!isSidebarCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap">Bancos</span>

                </>
              )}
            </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          <Link href="#" title={isSidebarCollapsed ? "Configurações" : undefined} className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all group`}>
            <Settings className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Configurações</span>}
          </Link>
          <Link href="#" title={isSidebarCollapsed ? "Sair" : undefined} className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all group`}>
            <LogOut className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Sair</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
                    <div className="hidden md:flex items-center bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
            <Search className="w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Pesquisar em toda plataforma..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-zinc-300 placeholder:text-zinc-600"
            />
          </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationCenter />
            
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
