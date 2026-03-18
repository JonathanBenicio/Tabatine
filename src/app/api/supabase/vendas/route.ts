import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get query params for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '500');
    const year = searchParams.get('year') || 'all';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('PedidosVenda')
      .select(`
        *,
        Clientes (*),
        Vendedores (*),
        ContasCorrente (*),
        ItensPedido (
          *,
          Produtos (*)
        ),
        PedidoParcelas (*)
      `, { count: 'exact' });

    if (year !== 'all') {
      const yearInt = parseInt(year);
      const startOfYear = `${yearInt}-01-01T00:00:00Z`;
      const endOfYear = `${yearInt}-12-31T23:59:59Z`;
      query = query.gte('DataPrevisao', startOfYear).lte('DataPrevisao', endOfYear);
    }

    const { data, error, count } = await query
      .order('DataPrevisao', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map Supabase structure to something closer to Omie's nested structure
    // so we can reuse the store's processing logic with minimal changes.
    const mappedData = (data || []).map((order: any) => ({
      cabecalho: {
        codigo_pedido: order.OmieId,
        numero_pedido: order.NumeroPedido,
        etapa: order.Etapa,
        data_previsao: order.DataPrevisao,
        codigo_cliente: order.Clientes?.OmieId,
        codigo_parcela: order.CodigoParcela,
      },
      det: (order.ItensPedido || []).map((item: any) => ({
        produto: {
          codigo: item.Produtos?.CodigoProduto,
          descricao: item.Produtos?.Descricao,
          unidade: item.Produtos?.UnidadeMedida || 'UN',
          valor_unitario: item.ValorUnitario,
          quantidade: item.Quantidade,
          valor_total: item.ValorTotal,
          percentual_desconto: item.PercentualDesconto,
          valor_desconto: item.ValorDesconto,
          ncm: item.Produtos?.Ncm,
        },
        imposto: {
          icms: { valor_icms: item.ValorIcms },
          pis_padrao: { valor_pis: item.ValorPis },
          cofins_padrao: { valor_cofins: item.ValorCofins },
        },
        ide: {
          codigo_item: item.OmieId
        }
      })),
      lista_parcelas: {
        parcela: (order.PedidoParcelas || []).map((p: any) => ({
          numero_parcela: p.NumeroParcela,
          valor: p.Valor,
          data_vencimento: p.DataVencimento,
          percentual: p.Percentual
        }))
      },
      informacoes_adicionais: {
        codVend: order.Vendedores?.OmieId,
        vendedor_nome: order.Vendedores?.Nome,
        codigo_conta_corrente: order.ContasCorrente?.OmieId,
        conta_corrente_nome: order.ContasCorrente?.Descricao,
        contato: order.Contato
      },
      infoCadastro: {
        dFat: order.Faturado ? order.UpdatedAt : '', // Placeholder or actual billing date if added later
        numero_nfe: '', // We would need a join with NotasFiscais to get this accurately
        uInc: order.UsuarioInclusao,
        uAlt: order.UsuarioAlteracao,
        cancelado: order.Cancelado ? 'S' : 'N',
        autorizado: order.Autorizado ? 'S' : 'N',
        denegado: order.Denegado ? 'S' : 'N',
        cliente_nome: order.Clientes?.RazaoSocial || order.Clientes?.NomeFantasia
      },
      total_pedido: {
        valor_total_pedido: order.ValorTotal
      },
      frete: {
        valor_frete: order.ValorFrete,
        quantidade_volumes: order.QuantidadeVolumes,
        codigo_transportadora: order.Transportadora
      },
      observacoes: {
        obs_venda: order.ObservacoesVenda
      }
    }));

    return NextResponse.json({
      pedido_venda_produto: mappedData,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: any) {
    console.error('API Error (Supabase Vendas):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
