import React from "react";
import { Eye } from "lucide-react";
import Pagination from "@/components/Pagination";
import { OfxTransaction } from "@/lib/ofxParser";
import { formatBRL } from "@/utils/format";

interface TransactionsTableProps {
  transactions: OfxTransaction[];
  currentPage: number;
  totalPaginas: number;
  onPageChange: (page: number) => void;
  onViewTransaction: (transaction: OfxTransaction) => void;
}

export function TransactionsTable({
  transactions,
  currentPage,
  totalPaginas,
  onPageChange,
  onViewTransaction,
}: TransactionsTableProps) {
  return (
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
            {transactions.map((t) => (
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
                    onClick={() => onViewTransaction(t)}
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
        onPageChange={onPageChange}
      />
    </div>
  );
}
