import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get query params for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const year = searchParams.get('year') || 'all';
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Use !inner on Clientes ONLY when searching to avoid logic tree parsing errors
    // and to allow filtering by joined table fields.
    const clientesSelect = search ? 'Clientes!inner (*)' : 'Clientes (*)';

    let query = supabase
      .from('PedidosVenda')
      .select(`
        *,
        ${clientesSelect},
        Vendedores (*),
        ContasCorrente (*),
        ItensPedido (
          *,
          Produtos (*)
        ),
        PedidoParcelas (*),
        NotasFiscais (*)
      `, { count: 'exact' });

    // Search filter across parent and joined tables
    if (search) {
      query = query.or(`NumeroPedido.ilike.%${search}%,Clientes.RazaoSocial.ilike.%${search}%,Clientes.NomeFantasia.ilike.%${search}%`);
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

    // Map Supabase structure to something closer to Omie's nested structure
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
          meio_pagamento: order.MeioPagamento,
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
            icms: { valor_icms: item.ValorIcms },
            pis_padrao: { valor_pis: item.ValorPis },
            cofins_padrao: { valor_cofins: item.ValorCofins },
            ipi: { valor_ipi: item.ValorIpi }
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
          perc_comissao: order.ComissaoVendedor,
          codigo_conta_corrente: order.ContasCorrente?.OmieId,
          conta_corrente_nome: order.ContasCorrente?.Descricao,
          contato: order.Contato
        },
        infoCadastro: {
          dFat: nf?.DataEmissao || '',
          dInc: order.DataInclusao || order.CreatedAt,
          uInc: order.UsuarioInclusao,
          dAlt: order.UpdatedAt,
          uAlt: order.UsuarioAlteracao,
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
