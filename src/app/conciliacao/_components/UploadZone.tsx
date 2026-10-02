import React from "react";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadZone({ onFileUpload }: UploadZoneProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/10 backdrop-blur-xl p-16 text-center hover:border-emerald-500/50 transition-all duration-500 shadow-2xl">
      <input
        type="file"
        accept=".ofx"
        onChange={onFileUpload}
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
  );
}
