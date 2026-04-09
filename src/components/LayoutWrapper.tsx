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
  ChevronRight,
  UserCircle,
  Webhook,
  Home
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { logout } from '@/app/auth/actions';

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
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-zinc-800/50 bg-slate-50 md:bg-white/80 dark:bg-zinc-950/95 md:dark:bg-zinc-950/50 backdrop-blur-xl flex flex-col fixed md:relative z-50 h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-300 dark:bg-zinc-800 rounded-full border border-zinc-700 items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors z-10"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
          {/* Dashboard Group */}
          <NavGroup title="Principal" isCollapsed={isSidebarCollapsed}>
            <NavItem
              href="/"
              icon={Home}
              label="Home"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/'}
              activeColor="blue"
            />
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/dashboard'}
              activeColor="purple"
            />
          </NavGroup>

          {/* Sales Group */}
          <NavGroup title="Vendas" isCollapsed={isSidebarCollapsed}>
            <NavItem
              href="/vendas"
              icon={TrendingUp}
              label="Pedidos"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/vendas'}
              activeColor="orange"
            />
            <NavItem
              href="/nf"
              icon={FileText}
              label="Notas Fiscais"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/nf'}
              activeColor="blue"
            />
          </NavGroup>

          {/* Finance Group */}
          <NavGroup title="Financeiro" isCollapsed={isSidebarCollapsed}>
            <NavItem
              href="/financeiro/pagar"
              icon={Banknote}
              label="Contas a Pagar"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/financeiro/pagar'}
              activeColor="emerald"
            />
            <NavItem
              href="/financeiro/receber"
              icon={Banknote}
              label="Contas a Receber"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/financeiro/receber'}
              activeColor="emerald"
            />
            <NavItem
              href="/contas-correntes"
              icon={Building2}
              label="Bancos"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/contas-correntes'}
              activeColor="emerald"
            />
            <NavItem
              href="/conciliacao"
              icon={TrendingUp}
              label="Conciliação"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/conciliacao'}
              activeColor="emerald"
            />
          </NavGroup>

          {/* Registers Group */}
          <NavGroup title="Cadastros" isCollapsed={isSidebarCollapsed}>
            <NavItem
              href="/clientes"
              icon={Users}
              label="Clientes"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/clientes'}
              activeColor="blue"
            />
            <NavItem
              href="/produtos"
              icon={Package}
              label="Produtos"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/produtos'}
              activeColor="indigo"
            />
            <NavItem
              href="/vendedores"
              icon={ArrowRight}
              label="Vendedores"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/vendedores'}
              activeColor="blue"
            />
          </NavGroup>

          {/* Admin Group */}
          <NavGroup title="Administração" isCollapsed={isSidebarCollapsed}>
            <NavItem
              href="/admin/webhooks"
              icon={Webhook}
              label="Webhooks DLQ"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/admin/webhooks'}
              activeColor="rose"
              badge="Admin"
            />
            <NavItem
              href="/notificacoes"
              icon={Bell}
              label="Notificações"
              isCollapsed={isSidebarCollapsed}
              isActive={pathname === '/notificacoes'}
              activeColor="blue"
              indicator
            />
          </NavGroup>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          <Link href="/perfil" title={isSidebarCollapsed ? "Meu Perfil" : undefined} className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl ${pathname === '/perfil' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50'} transition-all group`}>
            <UserCircle className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Meu Perfil</span>}
          </Link>
          <Link href="#" title={isSidebarCollapsed ? "Configurações" : undefined} className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all group`}>
            <Settings className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Configurações</span>}
          </Link>
          <form action={logout} className="w-full">
            <button 
              type="submit"
              title={isSidebarCollapsed ? "Sair" : undefined} 
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all group`}
            >
              <LogOut className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span className="text-sm font-medium text-left">Sair</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 shrink-0 border-b border-slate-200 dark:border-zinc-800/50 bg-white/80 dark:bg-slate-100 dark:bg-zinc-900/20 backdrop-blur-xl shadow-sm dark:shadow-none px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 -ml-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
              <Search className="w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Pesquisar em toda plataforma..." 
                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-900 dark:text-zinc-300 placeholder:text-slate-500 dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationCenter />
            
            <div className="h-8 w-px bg-zinc-800"></div>

            <Link href="/perfil" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Administrador</p>
                <p className="text-xs text-zinc-500 tracking-tight">Ver Perfil</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-zinc-800 dark:to-zinc-700 border border-slate-300 dark:border-zinc-600 flex items-center justify-center p-0.5 relative ring-0 group-hover:ring-4 group-hover:ring-blue-500/10 transition-all">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=transparent" 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover bg-zinc-900"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900"></div>
              </div>
            </Link>
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

// Helper Components
interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  activeColor: 'blue' | 'purple' | 'orange' | 'emerald' | 'rose' | 'indigo';
  badge?: string;
  indicator?: boolean;
}

function NavItem({ href, icon: Icon, label, isCollapsed, isActive, activeColor, badge, indicator }: NavItemProps) {
  const colorMap = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-white', icon: 'text-blue-400', bar: 'bg-blue-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-white', icon: 'text-purple-400', bar: 'bg-purple-500' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-white', icon: 'text-orange-400', bar: 'bg-orange-500' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-white', icon: 'text-emerald-400', bar: 'bg-emerald-500' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-white', icon: 'text-rose-400', bar: 'bg-rose-500' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-white', icon: 'text-indigo-400', bar: 'bg-indigo-500' },
  };

  const colors = colorMap[activeColor];

  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all group relative overflow-hidden ${isActive ? `${colors.bg} ${colors.text}` : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50'}`}
    >
      {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar} rounded-r-md`}></div>}
      <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} ${isActive ? colors.icon : 'group-hover:text-current transition-colors'}`} />
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          {badge && (
            <span className={`ml-auto px-2 py-0.5 rounded-md ${colors.bg} ${colors.icon} text-[10px] uppercase font-bold`}>
              {badge}
            </span>
          )}
          {indicator && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>}
        </>
      )}
    </Link>
  );
}

function NavGroup({ title, children, isCollapsed }: { title: string; children: React.ReactNode; isCollapsed: boolean }) {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-2">
          {title}
        </p>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

