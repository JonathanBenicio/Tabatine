import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { formatBRL } from "@/utils/format";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

export function SummaryCards({ income, expenses, balance }: SummaryCardsProps) {
  return (
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
  );
}
