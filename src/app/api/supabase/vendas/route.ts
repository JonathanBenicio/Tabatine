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

    const num = (v: any) => v === null || v === undefined ? 0 : Number(v);

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
          quantidade_itens: itens.length,
          qtde_parcelas: order.QuantidadeParcelas || 0,
          faturado: order.Faturado ? 'S' : 'N',
          devolvido: order.Devolvido ? 'S' : 'N'
        },
        det: itens.map((item: any) => ({
          produto: {
            codigo: item.Produtos?.CodigoProduto,
            descricao: item.Produtos?.Descricao,
            unidade: item.UnidadeMedida || item.Produtos?.UnidadeMedida || 'UN',
            valor_unitario: num(item.ValorUnitario),
            quantidade: num(item.Quantidade),
            valor_total: num(item.ValorTotal),
            percentual_desconto: num(item.PercentualDesconto),
            valor_desconto: num(item.ValorDesconto),
            ncm: item.Produtos?.Ncm,
            cfop: item.Cfop || '--',
          },
          imposto: {
            icms: {
              valor_icms: num(item.ValorIcms),
              base_calculo: num(item.BaseIcms),
              aliquota: num(item.AliqIcms),
              cst: item.CstIcms
            },
            ipi: {
              valor_ipi: num(item.ValorIpi),
              base_calculo: num(item.BaseIpi),
              aliquota: num(item.AliqIpi),
              cst: item.CstIpi
            },
            pis_padrao: {
              valor_pis: num(item.ValorPis),
              base_calculo: num(item.BasePis),
              aliquota: num(item.AliqPis),
              cst: item.CstPis
            },
            cofins_padrao: {
              valor_cofins: num(item.ValorCofins),
              base_calculo: num(item.BaseCofins),
              aliquota: num(item.AliqCofins),
              cst: item.CstCofins
            },
            ibs: {
              valor_ibs: num(item.ValorIbs),
              aliquota_ibs_uf: num(item.AliqIbs),
              base_ibs_cbs: num(item.BaseIbsCbs)
            },
            cbs: {
              valor_cbs: num(item.ValorCbs),
              aliquota_cbs: num(item.AliqCbs),
              base_ibs_cbs: num(item.BaseIbsCbs)
            }
          },
          ide: {
            codigo_item: item.OmieId
          }
        })),
        lista_parcelas: {
          parcela: (order.PedidoParcelas || []).map((p: any) => ({
            numero_parcela: p.NumeroParcela,
            valor: num(p.Valor),
            data_vencimento: p.DataVencimento,
            percentual: num(p.Percentual),
            categoria: p.Categoria || '',
            nsu: p.Nsu || '',
            meio_pagamento: p.MeiosPagamento?.Descricao || ''
          }))
        },
        informacoes_adicionais: {
          codVend: order.Vendedores?.OmieId,
          vendedor_nome: order.Vendedores?.Nome,
          codigo_conta_corrente: order.ContasCorrente?.OmieId,
          // RECUPERANDO A DESCRIÇÃO DO BANCO/CONTA CORRENTE
          conta_corrente_nome: order.ContasCorrente?.Descricao || '',
          perc_comissao: num(order.ComissaoVendedor),
          contato: order.Contato,
          numero_pedido_cliente: order.NumeroPedidoCliente || '',
          consumidor_final: order.ConsumidorFinal || '',
          codProj: order.CodigoProjeto || 0
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
          valor_total_pedido: num(order.ValorTotal),
          valor_mercadorias: num(order.ValorMercadorias),
          valor_descontos: num(order.ValorDesconto || 0),
          valor_icms: num(order.ValorIcms),
          valor_IPI: num(order.ValorIpi),
          valor_pis: num(order.ValorPis),
          valor_cofins: num(order.ValorCofins),
          base_calculo_icms: num(order.BaseCalculoIcms),
          valor_iss: num(order.ValorIss || 0),
          valor_ir: num(order.ValorIr || 0),
          valor_csll: num(order.ValorCsll || 0),
          valor_inss: num(order.ValorInss || 0),
          valor_ibs: num(order.ValorIbs || 0),
          valor_cbs: num(order.ValorCbs || 0),
        },
        frete: {
          valor_frete: num(order.ValorFrete),
          quantidade_volumes: num(order.QuantidadeVolumes),
          codigo_transportadora: order.Transportadora,
          peso_bruto: num(order.PesoBruto),
          peso_liquido: num(order.PesoLiquido),
          previsao_entrega: order.PrevisaoEntrega || '',
          modalidade: order.FreteModalidade || '',
          codigo_rastreio: order.CodigoRastreio || '',
          link_rastreio: order.LinkRastreio || '',
          veiculo_proprio: order.VeiculoProprio || '',
          placa: order.Placa || '',
          valor_seguro: num(order.ValorSeguro || 0),
          outras_despesas: num(order.ValorOutrasDespesas || 0)
        },
        observacoes: {
          obs_venda: order.ObservacoesVenda,
          obs_interna: order.ObservacoesInternas,
          obs_nf: order.DadosAdicionaisNf || nf?.InformacoesComplementares,
          obs_nf_fisco: nf?.InformacoesFisco
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
