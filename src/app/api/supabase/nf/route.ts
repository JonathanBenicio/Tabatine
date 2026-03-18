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
        )
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
    const mappedData = (data || []).map((nf: any) => ({
      compl: {
        nIdNF: nf.OmieId,
        nNF: nf.NumeroNf,
        cChaveNFe: nf.ChaveAcesso,
        dEmi: nf.DataEmissao?.split('T')[0]?.split('-').reverse().join('/'),
        hEmi: nf.HoraEmissao,
      },
      ide: {
        dReg: nf.CreatedAt?.split('T')[0]?.split('-').reverse().join('/'),
        hReg: nf.CreatedAt?.split('T')[1]?.substring(0, 5),
        cStatus: nf.CodigoStatus?.toString(),
      },
      nfDestInt: {
        xNome: nf.Clientes?.RazaoSocial || nf.Clientes?.NomeFantasia,
        nCodCli: nf.Clientes?.OmieId,
        cnpj_cpf: nf.Clientes?.CnpjCpf,
      },
      nfEmitInt: {},
      info: {
        cImpAPI: 'S'
      },
      total: {
        ICMSTot: {
          vNF: nf.ValorTotal,
        }
      },
      det: (nf.ItensNotaFiscal || []).map((item: any) => ({
        prod: {
          cCod: item.Produtos?.CodigoProduto,
          xProd: item.Produtos?.Descricao,
          uCom: item.Produtos?.UnidadeMedida,
          qCom: item.Quantidade,
          vUnCom: item.ValorUnitario,
          vProd: item.ValorTotal,
        }
      }))
    }));

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
