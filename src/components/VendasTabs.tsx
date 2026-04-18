'use client';

import React, { useState, Suspense } from 'react';
import { ShoppingBag, FileText } from 'lucide-react';
import VendasTable from './VendasTable';
import NfTable from './NfTable';
import { TableContainer } from './ui/TableContainer';

type Tab = 'pedidos' | 'notas';

export default function VendasTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('pedidos');

  const tabs = [
    { id: 'pedidos', label: 'Pedidos de Venda', icon: ShoppingBag, color: 'orange' },
    { id: 'notas', label: 'Notas Fiscais', icon: FileText, color: 'blue' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Tabs Navigation */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                ${isActive 
                  ? `bg-white dark:bg-zinc-800 text-${tab.color}-600 dark:text-white shadow-xl shadow-black/5 dark:shadow-none border border-slate-200 dark:border-zinc-700` 
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? `text-${tab.color}-500` : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'pedidos' ? (
          <Suspense fallback={<TableContainer isLoading={true}><div/></TableContainer>}>
            <VendasTable />
          </Suspense>
        ) : (
          <NfTable />
        )}
      </div>
    </div>
  );
}
