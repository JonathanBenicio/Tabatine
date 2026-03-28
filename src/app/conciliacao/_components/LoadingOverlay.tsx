import React from "react";
import { PieChart } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xl z-[120] flex flex-col items-center justify-center">
       <PieChart size={48} className="text-emerald-500 animate-bounce" />
       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-8 animate-pulse">Extraindo Dados...</p>
    </div>
  );
}
