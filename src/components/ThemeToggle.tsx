'use client';

import { useThemeStore, Theme } from '@/store/useThemeStore';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  isSidebarCollapsed: boolean;
}

export function ThemeToggle({ isSidebarCollapsed }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={`flex items-center w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all group`}
      >
        <Monitor className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
        {!isSidebarCollapsed && <span className="text-sm font-medium">Tema</span>}
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  const getIcon = () => {
    if (theme === 'system') return <Monitor className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />;
    if (theme === 'dark') return <Moon className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />;
    return <Sun className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'Tema: Sistema';
    if (theme === 'dark') return 'Tema: Escuro';
    return 'Tema: Claro';
  };

  return (
    <button
      onClick={cycleTheme}
      title={isSidebarCollapsed ? getLabel() : undefined}
      className={`flex items-center w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all group`}
    >
      {getIcon()}
      {!isSidebarCollapsed && <span className="text-sm font-medium">{getLabel()}</span>}
    </button>
  );
}
