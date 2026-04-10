import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MeioDetails from '@/components/MeioDetails';

export const metadata = {
  title: 'Detalhe do Meio de Pagamento | Tabatine',
  description: 'Detalhes do meio de pagamento integrado ao ERP Omie.',
};

export default async function MeioDetailPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/auth/login');

  return (
    <div className="animate-in fade-in duration-700">
      <MeioDetails />
    </div>
  );
}
