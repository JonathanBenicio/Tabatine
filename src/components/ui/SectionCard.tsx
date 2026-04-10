// src/components/ui/SectionCard.tsx
import React from 'react';

interface SectionCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

export function SectionCard({ icon: Icon, iconColor, title, children }: SectionCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Icon className={iconColor} size={20} />
        {title}
      </h2>
      {children}
    </div>
  );
}
