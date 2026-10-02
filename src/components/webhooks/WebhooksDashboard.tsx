'use client';

import React from 'react';
import { WebhookStatsCards } from '@/components/webhooks/WebhookStatsCards';
import { useWebhookStatsQuery } from '@/hooks/useWebhooksQuery';

function StatsSection() {
  const { data: stats, isLoading } = useWebhookStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-zinc-900/30 border border-zinc-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return <WebhookStatsCards stats={stats} />;
}

export default function WebhooksDashboard() {
  return <StatsSection />;
}
