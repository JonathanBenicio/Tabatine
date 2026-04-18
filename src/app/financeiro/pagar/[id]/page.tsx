import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import FinanceiroDetails from '@/components/FinanceiroDetails';

export const metadata = {
  title: 'Detalhe do Título a Pagar | Tabatine',
  description: 'Detalhes da fatura a pagar integrada ao ERP Omie.',
};

export default async function FinanceiroPagarDetailPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <FinanceiroDetails type="pagar" />
    </div>
  );
}
