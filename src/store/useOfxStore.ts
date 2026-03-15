import { create } from 'zustand';
import { OfxData, OfxTransaction, parseOfx } from '@/lib/ofxParser';

interface OfxStoreState {
  data: OfxData | null;
  loading: boolean;
  error: string | null;
  importFile: (file: File) => Promise<void>;
  clearData: () => void;
}

export const useOfxStore = create<OfxStoreState>((set) => ({
  data: null,
  loading: false,
  error: null,

  importFile: async (file: File) => {
    set({ loading: true, error: null });
    
    try {
      const text = await file.text();
      const parsed = parseOfx(text);
      
      if (parsed.transactions.length === 0) {
        throw new Error('Nenhuma transação encontrada no arquivo OFX.');
      }
      
      set({ data: parsed, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Erro ao processar arquivo.', loading: false });
    }
  },

  clearData: () => set({ data: null, error: null }),
}));
