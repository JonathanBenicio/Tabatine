import { useQuery } from '@tanstack/react-query'
import { NfCadastroFlat } from '@/store/useNfStore'

interface FetchNfsResponse {
  nfs: NfCadastroFlat[]
  totalPaginas: number
  totalRegistros: number
  currentPage: number
}

export const useNfQuery = (page: number, search: string, filters?: { 
  clienteOmieId?: number,
  enabled?: boolean
}) => {
  return useQuery<FetchNfsResponse>({
    queryKey: ['nfs', page, search, filters],
    enabled: filters?.enabled ?? true,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      })
      if (filters?.clienteOmieId) params.append('clienteOmieId', filters.clienteOmieId.toString());

      const response = await fetch(`/api/supabase/nf?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch NFs')
      }

      const rawNfs = data.nf_resumo_lista || []

      // --- Passive Lookup Population ---
      const { useLookupStore } = await import('@/store/useLookupStore')
      const lookupStore = useLookupStore.getState()
      const clientesMap: Record<number, string> = {}

      rawNfs.forEach((nf: any) => {
        if (nf.nfDestInt?.nCodCli && nf.nfDestInt?.xNome) {
          clientesMap[nf.nfDestInt.nCodCli] = nf.nfDestInt.xNome
        }
      })
      lookupStore.setClientes(clientesMap)

      const flatNfs: NfCadastroFlat[] = rawNfs.map((nf: any) => {
        const ide = nf.ide || {}
        const dest = nf.nfDestInt || {}
        const emit = nf.nfEmitInt || {}
        const compl = nf.compl || {}
        const info = nf.info || {}
        const total = nf.total || {}
        const icmsTot = total.ICMSTot || {}
        const issqnTot = total.ISSQNtot || {}
        const det = nf.det || []
        const titulos = nf.titulos || []

        const idNf = compl.nIdNF || nf.id_nf || Math.random()
        const nNF = ide.nNF || '---'
        const serie = ide.serie || '---'
        const modelo = ide.mod || '---'
        const dEmi = ide.dEmi || ''
        const hEmi = ide.hEmi || ''
        const dReg = ide.dReg || ''
        const dSaiEnt = ide.dSaiEnt || ''
        const hSaiEnt = ide.hSaiEnt || ''
        const dCan = ide.dCan || ''
        const dInut = ide.dInut || ''
        const tpNF = ide.tpNF || ''
        const finNFe = ide.finNFe || ''
        const tpAmb = ide.tpAmb || ''
        const indPag = ide.indPag || ''
        const cDeneg = ide.cDeneg || 'N'

        let statusLabel = ''
        if (cDeneg === 'S') statusLabel = 'Denegado'
        else if (dCan) statusLabel = 'Cancelado'
        else {
          const rawStatus = ide.cStatus || ''
          if (rawStatus === 'F') statusLabel = 'Faturado'
          else if (rawStatus === 'C') statusLabel = 'Cancelado'
          else if (rawStatus === 'D') statusLabel = 'Denegado'
          else if (rawStatus === 'A') statusLabel = 'Autorizado'
          else statusLabel = rawStatus || 'Pendente'
        }

        const razao = dest.xNome || 'Desconhecido'
        const cnpjCpf = dest.cnpj_cpf || '---'
        const nCodCli = dest.nCodCli || 0
        const nCodEmp = emit.nCodEmp || 0
        const vNF = icmsTot.vNF || 0
        const vProd = icmsTot.vProd || 0
        const vICMS = icmsTot.vICMS || 0
        const vBC = icmsTot.vBC || 0
        const vIPI = icmsTot.vIPI || 0

        const retencoes = total.Retencoes || {}
        const vPIS = icmsTot.vPIS || retencoes.vPIS || retencoes.vPISRetido || 0
        const vCOFINS = icmsTot.vCOFINS || retencoes.vCOFINS || retencoes.vCOFINSRetido || 0
        const vIR = retencoes.vIR || retencoes.vIRRF || 0
        const vCSLL = retencoes.vCSLL || 0

        const vFrete = icmsTot.vFrete || 0
        const vSeg = icmsTot.vSeg || 0
        const vDesc = icmsTot.vDesc || 0
        const vOutro = icmsTot.vOutro || 0
        const vTotTrib = icmsTot.vTotTrib || 0
        const vBCST = icmsTot.vBCST || 0
        const vST = icmsTot.vST || 0
        const vICMSDesonerado = icmsTot.vICMSDesonerado || 0
        const vII = icmsTot.vII || 0
        const vServ = issqnTot.vServ || 0
        const vISS = issqnTot.vISS || 0
        const chaveNfe = compl.cChaveNFe || ''
        const cCodCateg = compl.cCodCateg || ''
        const cModFrete = compl.cModFrete || ''
        const nIdPedido = compl.nIdPedido || 0
        const nIdReceb = compl.nIdReceb || 0
        const nIdTransp = compl.nIdTransp || 0
        const xNatureza = compl.xNatureza || '---'
        const cImpAPI = info.cImpAPI || 'N'
        const dAlt = info.dAlt || ''
        const hAlt = info.hAlt || ''
        const dInc = info.dInc || ''
        const hInc = info.hInc || ''
        const uAlt = info.uAlt || ''
        const uInc = info.uInc || ''

        const itensMapped = det.map((item: any) => {
          const prod = item.prod || {}
          const nfProdInt = item.nfProdInt || {}
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
          }
        })

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
        }))

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
        }
      })

      return {
        nfs: flatNfs,
        totalPaginas: data.total_de_paginas || 1,
        totalRegistros: data.total_de_registros || 0,
        currentPage: data.pagina || page,
      }
    },
    placeholderData: (previousData) => previousData,
  })
}
