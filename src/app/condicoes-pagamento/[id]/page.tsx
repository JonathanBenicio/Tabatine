import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CondicaoDetails from '@/components/CondicaoDetails';

export const metadata = {
  title: 'Detalhe da Condição de Pagamento | Tabatine',
  description: 'Detalhes da condição de pagamento integrada ao ERP Omie.',
};

export default async function CondicaoDetailPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/auth/login');

  return (
    <div className="animate-in fade-in duration-700">
      <CondicaoDetails />
    </div>
  );
}
