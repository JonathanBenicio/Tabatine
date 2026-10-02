import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EtapaDetails from '@/components/EtapaDetails';

export const metadata = {
  title: 'Detalhe da Etapa de Faturamento | Tabatine',
  description: 'Detalhes da etapa de faturamento integrada ao ERP Omie.',
};

export default async function EtapaDetailPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/auth/login');

  return (
    <div className="animate-in fade-in duration-700">
      <EtapaDetails />
    </div>
  );
}
