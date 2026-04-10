import { useQuery } from '@tanstack/react-query';
import { mapSupabaseToFinanceiros, TituloFinanceiro } from '@/lib/financeiro-mapper';

interface FetchFinanceiroResponse {
  titulos: TituloFinanceiro[];
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
}

export const useFinanceiroQuery = (
  type: 'pagar' | 'receber',
  page: number,
  search: string,
  enabled: boolean = true
) => {
  return useQuery<FetchFinanceiroResponse>({
    queryKey: ['financeiro', type, page, search],
    enabled: enabled,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
      });

      const response = await fetch(`/api/supabase/financeiro/${type}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch financeiro ${type}`);
      }

      const flatTitulos = mapSupabaseToFinanceiros(data.titulos || [], type);

      return {
        titulos: flatTitulos,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      };
    },
    placeholderData: (previousData) => previousData,
  });
};
