import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EtapasTable from '@/components/EtapasTable';

export const metadata = {
  title: 'Etapas de Faturamento | Tabatine',
  description: 'Gestão de etapas de faturamento e naturezas de operação.',
};

export default async function EtapasPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <EtapasTable />
    </div>
  );
}
