"use client";

import React, { useState, useMemo } from "react";
import { useOfxStore } from "@/store/useOfxStore";
import { 
  Upload, 
  Trash2, 
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  XCircle,
  Tag,
  Hash,
  Filter,
  PieChart,
  Eye,
  X,
  Info
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { OfxTransaction } from "@/lib/ofxParser";

export default function ConciliacaoPage() {
  const { data, loading, error, importFile, clearData } = useOfxStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<OfxTransaction | null>(null);
  const itemsPerPage = 15;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFile(file);
      setCurrentPage(1);
      setSelectedCategory(null);
    }
  };

  const categories = useMemo(() =>
    Array.from(new Set(data?.transactions.map(t => t.category) || [])),
    [data?.transactions]
  );

  const filteredTransactions = useMemo(() =>
    selectedCategory
      ? data?.transactions.filter(t => t.category === selectedCategory) || []
      : data?.transactions || [],
    [data?.transactions, selectedCategory]
  );

  const paginatedTransactions = useMemo(() =>
    filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [filteredTransactions, currentPage, itemsPerPage]
  );

  const totalPaginas = useMemo(() =>
    Math.ceil(filteredTransactions.length / itemsPerPage),
    [filteredTransactions.length, itemsPerPage]
  );

  const income = useMemo(() =>
    data?.transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((acc, t) => acc + t.amount, 0) || 0,
    [data?.transactions]
  );

  const expenses = useMemo(() =>
    data?.transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((acc, t) => acc + t.amount, 0) || 0,
    [data?.transactions]
  );

  const balance = useMemo(() => income - expenses, [income, expenses]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent tracking-tighter">
            Análise de Extrato
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Extração completa de dados e metadados bancários.</p>
        </div>

        {data && (
          <button 
            onClick={clearData}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all active:scale-95 font-bold text-xs uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Limpar Tudo
          </button>
        )}
      </div>

      {!data ? (
        <div className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/10 backdrop-blur-xl p-16 text-center hover:border-emerald-500/50 transition-all duration-500 shadow-2xl">
          <input
            type="file"
            accept=".ofx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center gap-6 relative z-0">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <Upload size={40} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Importar Arquivo OFX</h2>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                Arraste seu extrato para listar todos os dados e detalhes das transações de forma automatizada.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Entradas</p>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-emerald-400 tracking-tighter">{formatBRL(income)}</p>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl flex flex-col justify-between group hover:border-rose-500/40 transition-all">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Saídas</p>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 transition-transform">
                  <ArrowDownLeft size={20} />
                </div>
              </div>
              <p className="text-3xl font-black text-rose-400 tracking-tighter">{formatBRL(expenses)}</p>
            </div>

            <div className={`p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl flex flex-col justify-between group transition-all ${balance >= 0 ? 'hover:border-emerald-500/40' : 'hover:border-rose-500/40'}`}>
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Saldo Bancário</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <Wallet size={20} />
                </div>
              </div>
              <p className={`text-3xl font-black tracking-tighter ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                {formatBRL(balance)}
              </p>
            </div>
          </div>

          {/* Filters Area */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
              <Filter size={12} />
              Filtrar:
            </div>
            <button 
              onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${!selectedCategory ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="group relative rounded-[2.5rem] border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/20">
                    <th className="py-6 px-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Data</th>
                    <th className="py-6 px-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nome / Descrição Completa</th>
                    <th className="py-6 px-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Categoria</th>
                    <th className="py-6 px-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Valor</th>
                    <th className="py-6 px-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Dados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {paginatedTransactions.map((t) => (
                    <tr 
                      key={t.id} 
                      className="group/row hover:bg-emerald-500/[0.02] transition-all duration-300"
                    >
                      <td className="py-5 px-8 text-xs font-bold text-zinc-400 font-mono tracking-tighter">
                        {t.date.split('-').reverse().join('/')}
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-white group-hover/row:text-emerald-400 transition-colors">
                            {t.memo || t.name}
                          </span>
                          <div className="flex items-center gap-3">
                            {t.memo && t.memo !== t.name && t.name !== 'Sem nome' && (
                              <span className="text-[10px] text-zinc-600 font-medium">{t.name}</span>
                            )}
                            <span className="text-[10px] text-zinc-700 font-mono">#{t.checkNum}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight py-1 px-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                          {t.category}
                        </span>
                      </td>
                      <td className={`py-5 px-8 text-right font-black text-sm ${
                        t.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {t.type === 'CREDIT' ? '+' : '-'} {formatBRL(t.amount)}
                      </td>
                      <td className="py-5 px-8 text-center">
                        <button 
                          onClick={() => setViewingTransaction(t)}
                          className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 rounded-lg transition-all"
                          title="Listar todos os dados"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPaginas={totalPaginas}
              onPageChange={(p) => { setCurrentPage(p); }}
            />
          </div>
        </div>
      )}

      {/* Transaction Detail Drawer (Modal) */}
      {viewingTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setViewingTransaction(null)} />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Metadados da Transação</h3>
              </div>
              <button onClick={() => setViewingTransaction(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {Object.entries(viewingTransaction.rawTags).map(([tag, value]) => (
                <div key={tag} className="flex justify-between items-start gap-4 py-2 border-b border-zinc-800 last:border-0">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest shrink-0 mt-1">{tag}</span>
                  <span className="text-sm font-bold text-zinc-300 break-all text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-zinc-900/80 border-t border-zinc-800 text-center">
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Sincronizado via OFX Analyzer</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xl z-[120] flex flex-col items-center justify-center">
           <PieChart size={48} className="text-emerald-500 animate-bounce" />
           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-8 animate-pulse">Extraindo Dados...</p>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
