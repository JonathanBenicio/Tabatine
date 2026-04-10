import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import BancoDetails from '@/components/BancoDetails';

export const metadata = {
  title: 'Detalhe do Banco | Tabatine',
  description: 'Detalhes do banco integrado ao ERP Omie.',
};

export default async function BancoDetailPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <BancoDetails />
    </div>
  );
}
