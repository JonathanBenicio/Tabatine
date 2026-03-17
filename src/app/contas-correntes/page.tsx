import ContasCorrentesTable from '@/components/ContasCorrentesTable';

export const metadata = {
  title: 'Contas Correntes | Tabatine',
  description: 'Gestão de contas correntes e bancos sincronizada do Omie ERP.',
};

export default function ContasCorrentesPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <ContasCorrentesTable />
    </div>
  );
}
