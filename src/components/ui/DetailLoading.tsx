// src/components/ui/DetailLoading.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface DetailLoadingProps {
  message?: string;
}

export function DetailLoading({ message = 'Carregando detalhes...' }: DetailLoadingProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
      <p className="text-zinc-500 font-mono animate-pulse">{message}</p>
    </div>
  );
}
