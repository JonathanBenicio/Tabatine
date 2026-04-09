import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Webhook, ShieldAlert } from 'lucide-react';
import WebhooksDashboard from '@/components/webhooks/WebhooksDashboard';
import { WebhooksTable } from '@/components/webhooks/WebhooksTable';

export const metadata = {
  title: 'Admin — Webhooks DLQ | Tabatine',
  description: 'Gerenciamento da Dead-Letter Queue de webhooks do Omie ERP',
};

export default async function WebhooksAdminPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-[100vw] mx-auto space-y-6 animate-in fade-in zoom-in duration-500 overflow-x-hidden">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 p-8 shadow-2xl flex items-center justify-between">
        <div className="relative z-10 w-full md:w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wide mb-4 backdrop-blur-md">
            <ShieldAlert className="w-3 h-3 text-rose-200" />
            Administração do Sistema
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Webhooks — Dead Letter Queue</h1>
          <p className="text-rose-100 text-sm leading-relaxed max-w-2xl">
            Monitore e gerencie os eventos de webhook do Omie ERP que falharam no processamento. 
            Re-processe manualmente ou descarte eventos após investigação.
          </p>
        </div>
        {/* Decorações */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 hidden md:flex items-center justify-end pr-12">
          <Webhook className="w-40 h-40 text-white" />
        </div>
        <div className="w-32 h-32 absolute -right-8 -bottom-8 rounded-full bg-white/10 blur-3xl hidden md:block" />
        <div className="w-24 h-24 absolute right-16 top-0 rounded-full bg-rose-400/30 blur-2xl hidden md:block" />
      </div>

      {/* Stats Cards */}
      <WebhooksDashboard />

      {/* Tabela Principal */}
      <div className="space-y-4">
        <WebhooksTable />
      </div>
    </div>
  );
}
