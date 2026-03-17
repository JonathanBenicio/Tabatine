import VendedoresTable from '@/components/VendedoresTable';

export const metadata = {
  title: 'Vendedores | Tabatine',
  description: 'Gestão de vendedores sincronizada do Omie ERP.',
};

export default function VendedoresPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <VendedoresTable />
    </div>
  );
}
