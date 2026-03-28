import { useQuery } from '@tanstack/react-query';
import { VendaPlana, VendasFilters } from '@/store/useVendasStore';
import { useLookupStore } from '@/store/useLookupStore';
import { mapOrderToFlatVendas } from '@/lib/vendas-mapper';
import { SortingState, ColumnFiltersState } from '@tanstack/react-table';

interface FetchVendasResponse {
  vendas: VendaPlana[];
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
}

export const useVendasQuery = (
  page: number = 1, 
  pageSize: number = 10,
  search: string = '', 
  sorting: SortingState = [],
  columnFilters: ColumnFiltersState = [],
  filters: VendasFilters = {},
  enabled: boolean = true
) => {
  return useQuery<FetchVendasResponse>({
    queryKey: ['vendas', page, pageSize, search, sorting, columnFilters, filters],
    enabled,
    queryFn: async () => {
      const sortField = sorting[0]?.id || 'data';
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search,
        sortField,
        sortOrder,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.clienteOmieId && { clienteOmieId: filters.clienteOmieId.toString() }),
        ...(filters.vendedorOmieId && { vendedorOmieId: filters.vendedorOmieId.toString() }),
        ...(filters.contaCorrenteId && { contaCorrenteId: filters.contaCorrenteId.toString() }),
      });

      // Generic column filters from TanStack Table
      columnFilters.forEach(filter => {
        if (filter.value) {
          params.append(`filter_${filter.id}`, String(filter.value));
        }
      });

      const response = await fetch(`/api/supabase/vendas?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Vendas');
      }

      const rawPedidos = data.pedido_venda_produto || [];
      const lookupStore = useLookupStore.getState();

      const clientesMap: Record<number, string> = {};
      const vendedoresMap: Record<number, string> = {};
      const contasMap: Record<number, string> = {};

      rawPedidos.forEach((ped: any) => {
        if (ped.cabecalho?.codigo_cliente && ped.infoCadastro?.cliente_nome) {
          clientesMap[ped.cabecalho.codigo_cliente] = ped.infoCadastro.cliente_nome;
        }
        if (ped.informacoes_adicionais?.codVend && ped.informacoes_adicionais?.vendedor_nome) {
          vendedoresMap[ped.informacoes_adicionais.codVend] = ped.informacoes_adicionais.vendedor_nome;
        }
        if (ped.informacoes_adicionais?.codigo_conta_corrente && ped.informacoes_adicionais?.conta_corrente_nome) {
          contasMap[ped.informacoes_adicionais.codigo_conta_corrente] = ped.informacoes_adicionais.conta_corrente_nome;
        }
      });

      lookupStore.setClientes(clientesMap);
      lookupStore.setVendedores(vendedoresMap);
      lookupStore.setContas(contasMap);

      const flatVendas: VendaPlana[] = [];
      rawPedidos.forEach((ped: any) => {
        flatVendas.push(...mapOrderToFlatVendas(ped));
      });

      return {
        vendas: flatVendas,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      };
    },
    placeholderData: (previousData) => previousData,
  });
};
