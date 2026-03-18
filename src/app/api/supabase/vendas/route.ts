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
    
    // Get query params for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const year = searchParams.get('year') || 'all';
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // INCLUSÃO DO 'FormasPagamento (*)' PARA TRAZER A FORMA DE PAGAMENTO
    let query = supabase
      .from('PedidosVenda')
      .select(`
        *,
        Clientes (*),
        Vendedores (*),
        ContasCorrente (*),
        FormasPagamento (*),
        ItensPedido (
          *,
          Produtos (*)
        ),
        PedidoParcelas (*),
        NotasFiscais (*)
      `, { count: 'exact' });

    if (search) {
      const escapedSearch = escapeFilterValue(`%${search}%`);

      // Step A: Find IDs of clients matching the search term
      const { data: clientesMatch } = await supabase
        .from('Clientes')
        .select('Id')
        .or(`RazaoSocial.ilike.${escapedSearch},NomeFantasia.ilike.${escapedSearch}`);

      const clienteIds = (clientesMatch || []).map(c => c.Id);

      if (clienteIds.length > 0) {
        query = query.or(`NumeroPedido.ilike.${escapedSearch},ClienteId.in.(${clienteIds.join(',')})`);
      } else {
        query = query.or(`NumeroPedido.ilike.${escapedSearch}`);
      }
    }

    if (year !== 'all') {
      const yearInt = parseInt(year);
      const startOfYear = `${yearInt}-01-01T00:00:00Z`;
      const endOfYear = `${yearInt}-12-31T23:59:59Z`;
      query = query.gte('DataInclusao', startOfYear).lte('DataInclusao', endOfYear);
    }

    const { data, error, count } = await query
      .order('DataInclusao', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedData = (data || []).map((order: any) => {
      const itens = order.ItensPedido || [];
      const nf = (order.NotasFiscais || [])[0];

      return {
        cabecalho: {
          codigo_pedido: order.OmieId,
          numero_pedido: order.NumeroPedido,
          etapa: order.Etapa,
          data_pedido: order.DataInclusao || order.CreatedAt,
          data_previsao: order.DataPrevisao,
          codigo_cliente: order.Clientes?.OmieId,
          codigo_parcela: order.CodigoParcela,
          // RECUPERANDO A DESCRIÇÃO DA FORMA DE PAGAMENTO
          meio_pagamento: order.FormasPagamento?.Descricao || order.MeioPagamento || '',
          quantidade_itens: itens.length
        },
        det: itens.map((item: any) => ({
          produto: {
            codigo: item.Produtos?.CodigoProduto,
            descricao: item.Produtos?.Descricao,
            unidade: item.UnidadeMedida || item.Produtos?.UnidadeMedida || 'UN',
            valor_unitario: item.ValorUnitario,
            quantidade: item.Quantidade,
            valor_total: item.ValorTotal,
            percentual_desconto: item.PercentualDesconto,
            valor_desconto: item.ValorDesconto,
            ncm: item.Produtos?.Ncm,
          },
          imposto: {
            icms: {
              valor_icms: item.ValorIcms,
              base_calculo: item.BaseIcms,
              aliquota: item.AliqIcms,
              cst: item.CstIcms
            },
            ipi: {
              valor_ipi: item.ValorIpi,
              base_calculo: item.BaseIpi,
              aliquota: item.AliqIpi,
              cst: item.CstIpi
            },
            pis_padrao: {
              valor_pis: item.ValorPis,
              base_calculo: item.BasePis,
              aliquota: item.AliqPis
            },
            cofins_padrao: {
              valor_cofins: item.ValorCofins,
              base_calculo: item.BaseCofins,
              aliquota: item.AliqCofins
            }
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
          // RECUPERANDO A DESCRIÇÃO DO BANCO/CONTA CORRENTE
          conta_corrente_nome: order.ContasCorrente?.Descricao || '',
          perc_comissao: order.ComissaoVendedor,
          contato: order.Contato
        },
        infoCadastro: {
          dFat: nf?.DataEmissao || '',
          dInc: order.DataInclusao || order.CreatedAt,
          uInc: order.UsuarioInclusao,
          dAlt: order.UpdatedAt,
          uAlt: order.UsuarioAlteracao,
          // RECUPERANDO O NÚMERO DA NOTA FISCAL
          numero_nfe: nf?.NumeroNf || '',
          chave_nfe: nf?.ChaveAcesso || '',
          cancelado: order.Cancelado ? 'S' : 'N',
          autorizado: order.Autorizado ? 'S' : 'N',
          denegado: order.Denegado ? 'S' : 'N',
          cliente_nome: order.Clientes?.RazaoSocial || order.Clientes?.NomeFantasia
        },
        total_pedido: {
          valor_total_pedido: order.ValorTotal,
          valor_mercadorias: order.ValorMercadorias,
          valor_icms: order.ValorIcms,
          valor_IPI: order.ValorIpi,
          valor_pis: order.ValorPis,
          valor_cofins: order.ValorCofins,
          base_calculo_icms: order.BaseCalculoIcms,
          valor_iss: order.ValorIss || 0,
          valor_ir: order.ValorIr || 0,
          valor_csll: order.ValorCsll || 0,
          valor_inss: order.ValorInss || 0,
        },
        frete: {
          valor_frete: order.ValorFrete,
          quantidade_volumes: order.QuantidadeVolumes,
          codigo_transportadora: order.Transportadora,
          peso_bruto: order.PesoBruto,
          peso_liquido: order.PesoLiquido,
          previsao_entrega: order.PrevisaoEntrega || '',
          modalidade: order.FreteModalidade || ''
        },
        observacoes: {
          obs_venda: order.ObservacoesVenda,
          obs_interna: order.ObservacoesInternas
        }
      };
    });

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
