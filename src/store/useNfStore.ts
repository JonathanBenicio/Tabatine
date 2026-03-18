import { create } from 'zustand';

export interface NfCadastroFlat {
  id_nf: number;
  numero_nf: string;
  serie: string;
  modelo: string;
  data_emissao: string;
  hora_emissao: string;
  data_registro: string;
  data_saida_entrada: string;
  hora_saida_entrada: string;
  status_nf: string;
  tipo_nf: string;
  finalidade_nfe: string;
  tipo_ambiente: string;
  indicador_pagamento: string;
  denegado: string;
  data_cancelamento: string;
  data_inutilizacao: string;
  razao_social: string;
  cnpj_cpf: string;
  cod_cliente: number;
  cod_empresa: number;
  valor_total_nf: number;
  valor_produtos: number;
  valor_icms: number;
  valor_bc_icms: number;
  valor_ipi: number;
  valor_pis: number;
  valor_cofins: number;
  valor_frete: number;
  valor_seguro: number;
  valor_desconto: number;
  valor_outras: number;
  valor_total_tributos: number;
  valor_bc_st: number;
  valor_st: number;
  valor_icms_desonerado: number;
  valor_ii: number;
  valor_servicos: number;
  valor_iss: number;
  natureza_operacao: string;
  chave_nfe: string;
  cod_categoria: string;
  modalidade_frete: string;
  id_pedido: number;
  id_recebimento: number;
  id_transportador: number;
  importado_api: string;
  data_alteracao: string;
  hora_alteracao: string;
  data_inclusao: string;
  hora_inclusao: string;
  usuario_alteracao: string;
  usuario_inclusao: string;
  itens: any[];
  titulos: any[];
  omieData?: any;
  [key: string]: any;
}

interface NfStoreState {
  nfs: NfCadastroFlat[];
  loading: boolean;
  error: string | null;
  totalPaginas: number;
  totalRegistros: number;
  currentPage: number;
  fetchNfs: (page?: number) => Promise<void>;
}

export const useNfStore = create<NfStoreState>((set) => ({
  nfs: [],
  loading: false,
  error: null,
  totalPaginas: 1,
  totalRegistros: 0,
  currentPage: 1,

  fetchNfs: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/supabase/nf?page=${page}&limit=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch NFs from Supabase');
      }

      const rawNfs = data.nf_resumo_lista || [];
      
      // --- Passive Lookup Population ---
      const { useLookupStore } = await import('./useLookupStore');
      const lookupStore = useLookupStore.getState();
      const clientesMap: Record<number, string> = {};

      rawNfs.forEach((nf: any) => {
        if (nf.nfDestInt?.nCodCli && nf.nfDestInt?.xNome) {
          clientesMap[nf.nfDestInt.nCodCli] = nf.nfDestInt.xNome;
        }
      });
      lookupStore.setClientes(clientesMap);

      // Map each NF from the resumidos list
      const flatNfs: NfCadastroFlat[] = rawNfs.map((nf: any) => {
        const ide = nf.ide || {};
        const dest = nf.nfDestInt || {};
        const emit = nf.nfEmitInt || {};
        const compl = nf.compl || {};
        const info = nf.info || {};
        const total = nf.total || {};
        const icmsTot = total.ICMSTot || {};
        const issqnTot = total.ISSQNtot || {};
        const det = nf.det || [];
        const titulos = nf.titulos || [];

        // ID
        const idNf = compl.nIdNF || nf.id_nf || Math.random();

        // Número
        const nNF = ide.nNF || '---';

        // Série
        const serie = ide.serie || '---';

        // Modelo
        const modelo = ide.mod || '---';

        // Datas e horários (ide)
        const dEmi = ide.dEmi || '';
        const hEmi = ide.hEmi || '';
        const dReg = ide.dReg || '';
        const dSaiEnt = ide.dSaiEnt || '';
        const hSaiEnt = ide.hSaiEnt || '';
        const dCan = ide.dCan || '';
        const dInut = ide.dInut || '';

        // Tipo e finalidade
        const tpNF = ide.tpNF || '';
        const finNFe = ide.finNFe || '';
        const tpAmb = ide.tpAmb || '';
        const indPag = ide.indPag || '';
        const cDeneg = ide.cDeneg || 'N';

        // Status
        let statusLabel = '';
        if (cDeneg === 'S') statusLabel = 'Denegado';
        else if (dCan) statusLabel = 'Cancelado';
        else {
          const rawStatus = ide.cStatus || '';
          if (rawStatus === 'F') statusLabel = 'Faturado';
          else if (rawStatus === 'C') statusLabel = 'Cancelado';
          else if (rawStatus === 'D') statusLabel = 'Denegado';
          else if (rawStatus === 'A') statusLabel = 'Autorizado';
          else statusLabel = rawStatus || 'Pendente';
        }

        // Destinatário
        const razao = dest.xNome || 'Desconhecido';
        const cnpjCpf = dest.cnpj_cpf || '---';
        const nCodCli = dest.nCodCli || 0;

        // Emitente
        const nCodEmp = emit.nCodEmp || 0;

        // Totais ICMS
        const vNF = icmsTot.vNF || 0;
        const vProd = icmsTot.vProd || 0;
        const vICMS = icmsTot.vICMS || 0;
        const vBC = icmsTot.vBC || 0;
        const vIPI = icmsTot.vIPI || 0;
        
        // Retenções / Outros
        const retencoes = total.Retencoes || {};
        const vPIS = icmsTot.vPIS || retencoes.vPIS || retencoes.vPISRetido || 0;
        const vCOFINS = icmsTot.vCOFINS || retencoes.vCOFINS || retencoes.vCOFINSRetido || 0;
        const vIR = retencoes.vIR || retencoes.vIRRF || 0;
        const vCSLL = retencoes.vCSLL || 0;

        const vFrete = icmsTot.vFrete || 0;
        const vSeg = icmsTot.vSeg || 0;
        const vDesc = icmsTot.vDesc || 0;
        const vOutro = icmsTot.vOutro || 0;
        const vTotTrib = icmsTot.vTotTrib || 0;
        const vBCST = icmsTot.vBCST || 0;
        const vST = icmsTot.vST || 0;
        const vICMSDesonerado = icmsTot.vICMSDesonerado || 0;
        const vII = icmsTot.vII || 0;

        // Totais ISSQN
        const vServ = issqnTot.vServ || 0;
        const vISS = issqnTot.vISS || 0;

        // Complementar
        const chaveNfe = compl.cChaveNFe || '';
        const cCodCateg = compl.cCodCateg || '';
        const cModFrete = compl.cModFrete || '';
        const nIdPedido = compl.nIdPedido || 0;
        const nIdReceb = compl.nIdReceb || 0;
        const nIdTransp = compl.nIdTransp || 0;
        const xNatureza = compl.xNatureza || '---';

        // Info (auditoria)
        const cImpAPI = info.cImpAPI || 'N';
        const dAlt = info.dAlt || '';
        const hAlt = info.hAlt || '';
        const dInc = info.dInc || '';
        const hInc = info.hInc || '';
        const uAlt = info.uAlt || '';
        const uInc = info.uInc || '';

        // Itens mapeados
        const itensMapped = det.map((item: any) => {
          const prod = item.prod || {};
          const nfProdInt = item.nfProdInt || {};
          return {
            codigo_produto: prod.cProd || '',
            descricao: prod.xProd || '',
            ncm: prod.NCM || '',
            cfop: prod.CFOP || '',
            unidade: prod.uCom || '',
            quantidade: prod.qCom || 0,
            valor_unitario: prod.vUnCom || 0,
            valor_total: prod.vProd || 0,
            valor_total_item: prod.vTotItem || 0,
            valor_desconto: prod.vDesc || 0,
            valor_frete: prod.vFrete || 0,
            valor_seguro: prod.vSeg || 0,
            valor_outras: prod.vOutro || 0,
            ean: prod.cEAN || '',
            origem: prod.cOrigem || '',
            nCodProd: nfProdInt.nCodProd || 0,
            nCodItem: nfProdInt.nCodItem || 0,
          };
        });

        // Títulos mapeados
        const titulosMapped = titulos.map((t: any) => ({
          numero_titulo: t.cNumTitulo || '',
          documento: t.cDoc || '',
          parcela: t.nParcela || 0,
          total_parcelas: t.nTotParc || 0,
          valor: t.nValorTitulo || 0,
          data_emissao: t.dDtEmissao || '',
          data_vencimento: t.dDtVenc || '',
          data_previsao: t.dDtPrevisao || '',
          cod_categoria: t.cCodCateg || '',
          cod_titulo: t.nCodTitulo || 0,
        }));

        return {
          id_nf: idNf,
          numero_nf: nNF.toString(),
          serie,
          modelo,
          data_emissao: dEmi,
          hora_emissao: hEmi,
          data_registro: dReg,
          data_saida_entrada: dSaiEnt,
          hora_saida_entrada: hSaiEnt,
          status_nf: statusLabel,
          tipo_nf: tpNF,
          finalidade_nfe: finNFe,
          tipo_ambiente: tpAmb,
          indicador_pagamento: indPag,
          denegado: cDeneg,
          data_cancelamento: dCan,
          data_inutilizacao: dInut,
          razao_social: razao,
          cnpj_cpf: cnpjCpf,
          cod_cliente: nCodCli,
          cod_empresa: nCodEmp,
          valor_total_nf: vNF,
          valor_produtos: vProd,
          valor_icms: vICMS,
          valor_bc_icms: vBC,
          valor_ipi: vIPI,
          valor_pis: vPIS,
          valor_cofins: vCOFINS,
          valor_frete: vFrete,
          valor_seguro: vSeg,
          valor_desconto: vDesc,
          valor_outras: vOutro,
          valor_total_tributos: vTotTrib,
          valor_bc_st: vBCST,
          valor_st: vST,
          valor_icms_desonerado: vICMSDesonerado,
          valor_ii: vII,
          valor_servicos: vServ,
          valor_iss: vISS,
          natureza_operacao: xNatureza,
          chave_nfe: chaveNfe,
          cod_categoria: cCodCateg,
          modalidade_frete: cModFrete,
          id_pedido: nIdPedido,
          id_recebimento: nIdReceb,
          id_transportador: nIdTransp,
          importado_api: cImpAPI,
          data_alteracao: dAlt,
          hora_alteracao: hAlt,
          data_inclusao: dInc,
          hora_inclusao: hInc,
          usuario_alteracao: uAlt,
          usuario_inclusao: uInc,
          itens: itensMapped,
          titulos: titulosMapped,
          omieData: nf,
        };
      });

      set({
        nfs: flatNfs,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
