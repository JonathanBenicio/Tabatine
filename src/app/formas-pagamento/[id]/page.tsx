import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import FormaDetails from '@/components/FormaDetails';

export const metadata = {
  title: 'Detalhe da Forma de Pagamento | Tabatine',
  description: 'Detalhes da forma de pagamento integrada ao ERP Omie.',
};

export default async function FormaDetailPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/auth/login');

  return (
    <div className="animate-in fade-in duration-700">
      <FormaDetails />
    </div>
  );
}
