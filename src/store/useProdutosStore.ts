import { create } from 'zustand';

export interface Produto {
  codigo_produto: number;
  codigo_produto_integracao: string;
  codigo: string;
  descricao: string;
  unidade: string;
  valor_unitario: number;
  ncm: string;
  excluido: 'S' | 'N';
}

interface ProdutosStoreState {
  produtos: Produto[];
  loading: boolean;
  error: string | null;
  hasFetchedInitial: boolean;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchProdutos: (page?: number, forceRefresh?: boolean) => Promise<void>;
}

export const useProdutosStore = create<ProdutosStoreState>((set, get) => ({
  produtos: [],
  loading: false,
  error: null,
  hasFetchedInitial: false,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchProdutos: async (page = 1, forceRefresh = false) => {
    // Avoid double fetch if already on the same page
    if (page === get().currentPage && get().hasFetchedInitial && !forceRefresh) return;

    set({ loading: true, error: null, hasFetchedInitial: true });
    
    try {
      const registrosPorPagina = 50;
      const targetPage = page;

      // --- CACHE CHECK (2 minutes) ---
      const cacheKey = `omie_produtos_page_${targetPage}`;
      const cachedDataRaw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      let shouldUseCache = false;
      let data;

      if (cachedDataRaw) {
        try {
          const cachedPayload = JSON.parse(cachedDataRaw);
          const cacheAgeMs = Date.now() - cachedPayload.timestamp;
          if (cacheAgeMs < 120 * 1000) {
            data = cachedPayload.data;
            shouldUseCache = true;
          }
        } catch (e) {
          // Ignore broken cache
        }
      }

      if (!shouldUseCache) {
        const response = await fetch('/api/omie/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            call: 'ListarProdutos',
            param: [
              {
                pagina: targetPage,
                registros_por_pagina: registrosPorPagina,
                apenas_importado_api: 'N',
                filtrar_apenas_omiepdv: 'N'
              }
            ]
          }),
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch produtos');
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: data
          }));
        }
      }

      const rawProdutos = data.produto_servico_cadastro || [];
      
      set({
        produtos: rawProdutos,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error loading products';
      if (errorMessage.includes('consumo indevido') || errorMessage.includes('425')) {
        set({ 
          error: 'Limite de requisições atingido. Aguarde 1 minuto.',
          loading: false 
        });
      } else {
        set({ error: errorMessage, loading: false });
      }
    }
  },
}));
