import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MeiosTable from '@/components/MeiosTable';

export const metadata = {
  title: 'Meios de Pagamento | Tabatine',
  description: 'Tipos de meios de quitação disponíveis no ERP Omie.',
};

export default async function MeiosPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <MeiosTable />
    </div>
  );
}
