import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import FormasTable from '@/components/FormasTable';

export const metadata = {
  title: 'Formas de Pagamento | Tabatine',
  description: 'Consulte as formas e parcelamentos disponíveis no ERP Omie.',
};

export default async function FormasPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return (
    <div className="animate-in fade-in duration-700">
      <FormasTable />
    </div>
  );
}
