import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import BancosTable from '@/components/BancosTable';

export const metadata = {
  title: 'Bancos | Tabatine',
  description: 'Visualização dos Bancos integrados ao ERP Omie.',
};

export default async function BancosPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <BancosTable />
    </div>
  );
}
