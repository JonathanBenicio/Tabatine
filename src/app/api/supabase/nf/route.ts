import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const year = searchParams.get('year') || 'all';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('NotasFiscais')
      .select(`
        *,
        Clientes (*),
        ItensNotaFiscal (
          *,
          Produtos (*)
        ),
        NotaFiscalTitulos (*)
      `, { count: 'exact' });

    if (year !== 'all') {
      const yearInt = parseInt(year);
      const startOfYear = `${yearInt}-01-01T00:00:00Z`;
      const endOfYear = `${yearInt}-12-31T23:59:59Z`;
      query = query.gte('DataEmissao', startOfYear).lte('DataEmissao', endOfYear);
    }

    const { data, error, count } = await query
      .order('DataEmissao', { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map Supabase structure to something compatible with the store's logic
    const mappedData = (data || []).map((nf: any) => {
      const dataEmiFormatada = nf.DataEmissao?.split('T')[0]?.split('-').reverse().join('/');
      
      // Status derivado do campo texto sincronizado do Omie (Status: AUTORIZADA/CANCELADA/DENEGADA)
      const statusTexto = nf.Status || '';
      let statusLabel = '';
      if (statusTexto === 'CANCELADA') statusLabel = 'Cancelado';
      else if (statusTexto === 'DENEGADA' || nf.Denegada) statusLabel = 'Denegado';
      else if (statusTexto === 'AUTORIZADA') statusLabel = 'Autorizado';
      else statusLabel = statusTexto || 'Pendente';

      return {
        compl: {
          nIdNF: nf.OmieId,
          nNF: nf.NumeroNf,
          cChaveNFe: nf.ChaveAcesso,
          dEmi: dataEmiFormatada,
          hEmi: nf.HoraEmissao,
          xNatureza: nf.NaturezaOperacao || 'Venda de Mercadoria',
          cInfCpl: nf.InformacoesComplementares,
          cInfAdFisco: nf.InformacoesFisco,
        },
        ide: {
          dEmi: dataEmiFormatada, // Crucial for useNfStore
          hEmi: nf.HoraEmissao,
          dReg: nf.CreatedAt?.split('T')[0]?.split('-').reverse().join('/'),
          hReg: nf.CreatedAt?.split('T')[1]?.substring(0, 5),
          cStatus: statusLabel,
          nNF: nf.NumeroNf,
          serie: nf.Serie || '1',
          mod: nf.Modelo || '55', 
          tpNF: nf.TipoOperacao,
          finNFe: nf.Finalidade,
          cAmbiente: nf.Ambiente,
          cDeneg: nf.Denegada ? 'S' : 'N',
        },
        nfDestInt: {
          xNome: nf.Clientes?.RazaoSocial || nf.Clientes?.NomeFantasia,
          nCodCli: nf.Clientes?.OmieId,
          cnpj_cpf: nf.Clientes?.CnpjCpf,
        },
        nfEmitInt: {},
        info: {
          cImpAPI: nf.ImportadoApi ? 'S' : 'N'
        },
        total: {
          ICMSTot: {
            vNF: nf.ValorTotal,
            vBC: nf.IcmsBaseCalculo || 0,
            vICMS: nf.IcmsValor || 0,
            vIPI: nf.ValorIpi || 0,
            vPIS: nf.ValorPis || 0,
            vCOFINS: nf.ValorCofins || 0,
            vProd: nf.ValorProd || 0,
            vFrete: nf.ValorFrete || 0,
            vSeg: nf.ValorSeguro || 0,
            vDesc: nf.ValorDesconto || 0,
            vOutro: nf.ValorOutrasDespesas || 0,
          },
          ISSQNtot: {
            vISS: nf.ValorIss || 0,
            vBC: nf.IssqnBaseCalculo || 0,
          },
          Retencoes: {
            vIRRF: nf.ValorIr || 0,
            vCSLL: nf.ValorCsll || 0,
            vPIS: nf.ValorPisRetido || 0,
            vCOFINS: nf.ValorCofinsRetido || 0,
          }
        },
        det: (nf.ItensNotaFiscal || []).map((item: any) => ({
          prod: {
            cProd: item.Produtos?.CodigoProduto,
            xProd: item.Produtos?.Descricao,
            uCom: item.Produtos?.UnidadeMedida,
            qCom: item.Quantidade,
            vUnCom: item.ValorUnitario,
            vProd: item.ValorTotal,
            vTotItem: item.ValorTotal,
            NCM: item.Ncm || item.Produtos?.Ncm || '---',
            CFOP: item.Cfop || '5102', // Fallback para venda padrão
          },
          imposto: {
            ICMS: {
              vBC: item.BaseIcms,
              pICMS: item.AliqIcms,
              CST: item.CstIcms
            },
            IPI: {
              vBC: item.BaseIpi,
              pIPI: item.AliqIpi,
              vIPI: item.ValorIpi,
              CST: item.CstIpi
            },
            PIS: { vPIS: item.ValorPis },
            COFINS: { vCOFINS: item.ValorCofins }
          }
        })),
        titulos: (nf.NotaFiscalTitulos || []).map((t: any) => ({
          nParcela: t.NumeroParcela,
          nValorTitulo: t.Valor,
          dDtVenc: t.DataVencimento?.split('T')[0]?.split('-').reverse().join('/'),
          nCodTitulo: t.OmieIdTitulo || 0,
        }))
      };
    });

    return NextResponse.json({
      nf_resumo_lista: mappedData,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: any) {
    console.error('API Error (Supabase NF):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
