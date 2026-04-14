/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server';
import { escapeFilterValue } from '@/utils/supabase/filter-utils';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const year = searchParams.get('year') || 'all';
    const search = searchParams.get('search') || '';
    const clienteOmieId = searchParams.get('clienteOmieId');
    const sortField = searchParams.get('sortField') || 'data_emissao';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('notas_fiscais')
      .select(`
        *,
        clientes!inner (*),
        pedidos_venda (omie_id),
        itens_nota_fiscal (
          *,
          produtos (*)
        ),
        nota_fiscal_titulos (*)
      `, { count: 'exact' });

    let dataToMap: Record<string, unknown>[] = [];
    let finalCount = 0;

    // Handle single item fetch if id is provided
    if (id) {
      const { data: singleData, error: singleError } = await query.eq('omie_id', parseInt(id)).single();
      if (singleError && singleError.code !== 'PGRST116') throw singleError;
      dataToMap = singleData ? [singleData] : [];
      finalCount = singleData ? 1 : 0;
    } else {
      if (clienteOmieId) {
        query = query.eq('clientes.omie_id', parseInt(clienteOmieId));
      }

      // 1. Search Logic (100% SDK)
      if (search) {
        const escapedSearch = escapeFilterValue(`%${search}%`);

        // Step A: Find IDs of clients matching the search term
        const { data: clientesMatch } = await supabase
          .from('clientes')
          .select('id')
          .or(`razao_social.ilike.${escapedSearch},nome_fantasia.ilike.${escapedSearch}`);

        const clienteIds = (clientesMatch || []).map(c => c.id);

        // Step B: Apply OR filter on main table (NF Number, Access Key OR matching ClientId)
        if (clienteIds.length > 0) {
          query = query.or(`numero_nf.ilike.${escapedSearch},chave_acesso.ilike.${escapedSearch},cliente_id.in.(${clienteIds.join(',')})`);
        } else {
          query = query.or(`numero_nf.ilike.${escapedSearch},chave_acesso.ilike.${escapedSearch}`);
        }
      }

      if (year !== 'all') {
        const yearInt = parseInt(year);
        const startOfYear = `${yearInt}-01-01T00:00:00Z`;
        const endOfYear = `${yearInt}-12-31T23:59:59Z`;
        query = query.gte('data_emissao', startOfYear).lte('data_emissao', endOfYear);
      }

      // Map frontend field to DB column
      let dbSortField = sortField;
      if (sortField === 'valor_total_nf') dbSortField = 'valor_total';
      if (sortField === 'razao_social') dbSortField = 'cliente_id'; // Placeholder for complex join sort

      const { data: listData, error: listError, count } = await query
        .order(dbSortField, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (listError) throw listError;
      dataToMap = listData || [];
      finalCount = count || 0;
    }

    // Map Supabase structure to something compatible with the store's logic
    const mappedData = dataToMap.map((nf: Record<string, unknown>) => {
      const dataEmiFormatada = (nf.data_emissao as any)?.split('T')[0]?.split('-').reverse().join('/');
      
      // Status derivado do campo texto sincronizado do Omie (Status: AUTORIZADA/CANCELADA/DENEGADA)
      const statusTexto = nf.status || '';
      let statusLabel = '';
      if (statusTexto === 'CANCELADA') statusLabel = 'Cancelado';
      else if (statusTexto === 'DENEGADA' || nf.denegada) statusLabel = 'Denegado';
      else if (statusTexto === 'AUTORIZADA') statusLabel = 'Autorizado';
      else statusLabel = (statusTexto as any) || 'Pendente';

      return {
        compl: {
          nIdNF: nf.omie_id,
          nNF: nf.numero_nf,
          cChaveNFe: nf.chave_acesso,
          dEmi: dataEmiFormatada,
          hEmi: nf.hora_emissao,
          xNatureza: nf.natureza_operacao || 'Venda de Mercadoria',
          cInfCpl: nf.informacoes_complementares,
          cInfAdFisco: nf.informacoes_fisco,
          nIdPedido: (nf as any).pedidos_venda?.omie_id,
        },
        pedido: {
          nCodPedido: (nf as any).pedidos_venda?.omie_id,
          cNumeroPedido: (nf as any).pedidos_venda?.numero_pedido_cliente || '', 
        },
        ide: {
          dEmi: dataEmiFormatada, // Crucial for useNfStore
          hEmi: nf.hora_emissao,
          dReg: (nf.created_at as any)?.split('T')[0]?.split('-').reverse().join('/'),
          hReg: (nf.created_at as any)?.split('T')[1]?.substring(0, 5),
          cStatus: statusLabel,
          nNF: nf.numero_nf,
          serie: nf.serie || '1',
          mod: nf.modelo || '55', 
          tpNF: nf.tipo_operacao,
          finNFe: nf.finalidade,
          cAmbiente: nf.ambiente,
          cDeneg: nf.denegada ? 'S' : 'N',
        },
        nfDestInt: {
          xNome: (nf as any).clientes?.razao_social || (nf as any).clientes?.nome_fantasia,
          nCodCli: (nf as any).clientes?.omie_id,
          cnpj_cpf: (nf as any).clientes?.cnpj_cpf,
        },
        nfEmitInt: {},
        info: {
          cImpAPI: nf.importado_api ? 'S' : 'N'
        },
        total: {
          ICMSTot: {
            vNF: nf.valor_total,
            vBC: nf.icms_base_calculo || 0,
            vICMS: nf.icms_valor || 0,
            vIPI: nf.valor_ipi || 0,
            vPIS: nf.valor_pis || 0,
            vCOFINS: nf.valor_cofins || 0,
            vProd: nf.valor_prod || 0,
            vFrete: nf.valor_frete || 0,
            vSeg: nf.valor_seguro || 0,
            vDesc: nf.valor_desconto || 0,
            vOutro: nf.valor_outras_despesas || 0,
          },
          ISSQNtot: {
            vISS: nf.valor_iss || 0,
            vBC: nf.issqn_base_calculo || 0,
          },
          Retencoes: {
            vIRRF: nf.valor_ir || 0,
            vCSLL: nf.valor_csll || 0,
            vPIS: nf.valor_pis_retido || 0,
            vCOFINS: nf.valor_cofins_retido || 0,
          }
        },
        det: (nf.itens_nota_fiscal as any[] || []).map((item: any) => ({
          prod: {
            cProd: item.produtos?.codigo_produto,
            xProd: item.produtos?.descricao,
            uCom: item.produtos?.unidade_medida,
            qCom: item.quantidade,
            vUnCom: item.valor_unitario,
            vProd: item.valor_total,
            vTotItem: item.valor_total,
            NCM: item.ncm || item.produtos?.ncm || '---',
            CFOP: item.cfop || '5102', // Fallback para venda padrão
          },
          imposto: {
            ICMS: {
              vBC: item.base_icms,
              pICMS: item.aliq_icms,
              CST: item.cst_icms
            },
            IPI: {
              vBC: item.base_ipi,
              pIPI: item.aliq_ipi,
              vIPI: item.valor_ipi,
              CST: item.cst_ipi
            },
            PIS: { vPIS: item.valor_pis },
            COFINS: { vCOFINS: item.valor_cofins }
          }
        })),
        titulos: (nf.nota_fiscal_titulos as any[] || []).map((t: any) => ({
          nParcela: t.numero_parcela,
          nValorTitulo: t.valor,
          dDtVenc: t.data_vencimento?.split('T')[0]?.split('-').reverse().join('/'),
          nCodTitulo: t.omie_id_titulo || 0,
        }))
      };

    });

    return NextResponse.json({
      nf_resumo_lista: mappedData,
      total_de_paginas: id ? 1 : Math.ceil(finalCount / limit),
      total_de_registros: finalCount,
      pagina: id ? 1 : page
    });

  } catch (error: unknown) {
    console.error('API Error (Supabase NF):', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
