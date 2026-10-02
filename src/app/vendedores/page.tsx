import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import VendedoresTable from '@/components/VendedoresTable';

export const metadata = {
  title: 'Vendedores | Tabatine',
  description: 'Gestão de vendedores sincronizada do Omie ERP.',
};

export default async function VendedoresPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <VendedoresTable />
    </div>
  );
}
