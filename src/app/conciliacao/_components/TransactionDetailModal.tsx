import React from "react";
import { X, Info } from "lucide-react";
import { OfxTransaction } from "@/lib/ofxParser";

interface TransactionDetailModalProps {
  transaction: OfxTransaction;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <span className="flex items-center justify-center"><Info size={20} /></span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Metadados da Transação</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {Object.entries(transaction.rawTags).map(([tag, value]) => (
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
  );
}
