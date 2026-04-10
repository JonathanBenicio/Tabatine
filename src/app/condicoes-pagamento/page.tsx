import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CondicoesTable from '@/components/CondicoesTable';

export const metadata = {
  title: 'Condições de Pagamento | Tabatine',
  description: 'Gestão de condições de faturamento.',
};

export default async function CondicoesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <CondicoesTable />
    </div>
  );
}
