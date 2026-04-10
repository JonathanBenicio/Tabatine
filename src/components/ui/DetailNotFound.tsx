// src/components/ui/DetailNotFound.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface DetailNotFoundProps {
  backHref: string;
  backLabel: string;
  entityName: string;
}

export function DetailNotFound({ backHref, backLabel, entityName }: DetailNotFoundProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <AlertCircle className="w-16 h-16 text-rose-500 mb-6 opacity-80" />
      <h2 className="text-2xl font-bold text-white mb-2">{entityName} não encontrado</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        Não foi possível localizar o registro solicitado. Ele pode ter sido removido ou o ID é inválido.
      </p>
      <button
        onClick={() => router.push(backHref)}
        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        {backLabel}
      </button>
    </div>
  );
}
