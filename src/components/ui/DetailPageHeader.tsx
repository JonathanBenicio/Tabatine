// src/components/ui/DetailPageHeader.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DetailPageHeaderProps {
  backHref: string;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
}

export function DetailPageHeader({ backHref, title, subtitle, badges }: DetailPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 mb-2">
      <button
        onClick={() => router.push(backHref)}
        className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95 group"
        aria-label="Voltar"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {badges}
        </div>
        {subtitle && (
          <p className="text-zinc-500 mt-1 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
