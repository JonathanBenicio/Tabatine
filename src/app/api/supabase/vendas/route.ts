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
    
    // Get query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const clienteOmieId = searchParams.get('clienteOmieId');
    const vendedorOmieId = searchParams.get('vendedorOmieId');
    const contaCorrenteId = searchParams.get('contaCorrenteId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortFieldFront = searchParams.get('sortField') || 'data';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const omieId = searchParams.get('omieId');

    // Map frontend field name to DB column name
    // Map frontend field name to DB column name for filtering/sorting
    const VENDA_COLUMN_MAP: Record<string, string> = {
      data: 'DataInclusao',
      pedido: 'NumeroPedido',
      numeroPedido: 'NumeroPedido',
      cliente: 'Clientes.Nome',
      vendedor: 'Vendedores.Nome',
      valorTotal: 'ValorTotal',
      etapa: 'Etapa',
      nf: 'NotasFiscais.NumeroNf',
      formaPg: 'MeioPagamento',
      banco: 'ContasCorrente.Descricao',
      vencimentoStatus: 'Etapa',
      produto: 'ItensPedido.Produtos.Descricao',
    };
    const sortField = VENDA_COLUMN_MAP[sortFieldFront] || sortFieldFront;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const activeFilters = Array.from(searchParams.entries())
      .filter(([key]) => key.startsWith('filter_'))
      .map(([key, value]) => ({ 
        field: key.replace('filter_', ''), 
        value 
      }));

    const searchFilterIds: { cliente?: number[]; vendedor?: number[]; banco?: number[] } = {};

    if (search || activeFilters.some(f => ['cliente', 'vendedor', 'banco'].includes(f.field))) {
      const escapedSearch = escapeFilterValue(`%${search}%`);
      
      // Lookup Clientes matching search or specific client filter
      const clientFilter = activeFilters.find(f => f.field === 'cliente');
      if (search || clientFilter) {
        let clientQuery = supabase.from('Clientes').select('Id');
        if (clientFilter) {
          clientQuery = clientQuery.ilike('Nome', `%${clientFilter.value}%`);
        } else {
          clientQuery = clientQuery.or(`RazaoSocial.ilike.${escapedSearch},NomeFantasia.ilike.${escapedSearch},Nome.ilike.${escapedSearch}`);
        }
        const { data: cData } = await clientQuery;
        if (cData) searchFilterIds.cliente = cData.map(c => (c as any).Id);
      }

      // Lookup Vendedores matching search or specific vendor filter
      const vendorFilter = activeFilters.find(f => f.field === 'vendedor');
      if (search || vendorFilter) {
        let vendorQuery = supabase.from('Vendedores').select('Id');
        if (vendorFilter) {
          vendorQuery = vendorQuery.ilike('Nome', `%${vendorFilter.value}%`);
        } else {
          vendorQuery = vendorQuery.ilike('Nome', escapedSearch);
        }
        const { data: vData } = await vendorQuery;
        if (vData) searchFilterIds.vendedor = vData.map(v => (v as any).Id);
      }

      // Lookup Bancos matching banco filter
      const bancoFilter = activeFilters.find(f => f.field === 'banco');
      if (bancoFilter) {
        const { data: bData } = await supabase.from('ContasCorrente').select('Id').ilike('Descricao', `%${bancoFilter.value}%`);
        if (bData) searchFilterIds.banco = bData.map(b => (b as any).Id);
      }
    }

    let query = supabase
      .from('PedidosVenda')
      .select(`
        *,
        Clientes (*),
        Vendedores (*),
        ContasCorrente (*),
        FormasPagamento (*),
        ItensPedido (*, Produtos (*)),
        PedidoParcelas (*),
        NotasFiscais (*)
      `, { count: 'exact' });

    if (omieId) {
      query = query.eq('OmieId', parseInt(omieId));
    } else {
      if (clienteOmieId) query = query.eq('Clientes.OmieId', parseInt(clienteOmieId));
      if (vendedorOmieId) query = query.eq('Vendedores.OmieId', parseInt(vendedorOmieId));
      if (contaCorrenteId) query = query.eq('ContasCorrente.OmieId', parseInt(contaCorrenteId));

      if (startDate) query = query.gte('DataInclusao', startDate);
      if (endDate) query = query.lte('DataInclusao', endDate);

      // Apply search across matches or NumeroPedido
      if (search) {
        const escapedSearch = escapeFilterValue(`%${search}%`);
        const orConditions = [`NumeroPedido.ilike.${escapedSearch}`];
        // Use root column ClienteId and VendedorId with the IDs we found
        if (searchFilterIds.cliente?.length) orConditions.push(`ClienteId.in.(${searchFilterIds.cliente.join(',')})`);
        if (searchFilterIds.vendedor?.length) orConditions.push(`VendedorId.in.(${searchFilterIds.vendedor.join(',')})`);
        query = query.or(orConditions.join(','));
      }

      // Apply column filters
      const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';
      activeFilters.forEach(({ field, value }) => {
        if (field === 'cliente') {
           if (searchFilterIds.cliente?.length) query = query.in('ClienteId', searchFilterIds.cliente);
           else if (value) query = query.eq('ClienteId', EMPTY_UUID); // Force empty result if filter typed but no match found
        } else if (field === 'vendedor') {
           if (searchFilterIds.vendedor?.length) query = query.in('VendedorId', searchFilterIds.vendedor);
           else if (value) query = query.eq('VendedorId', EMPTY_UUID);
        } else if (field === 'banco') {
           if (searchFilterIds.banco?.length) query = query.in('ContaCorrenteId', searchFilterIds.banco);
           else if (value) query = query.eq('ContaCorrenteId', EMPTY_UUID);
        } else {
           const dbColumn = VENDA_COLUMN_MAP[field] || field;
           const numericFields = ['valorTotal', 'valorVenda', 'frete', 'percComissao', 'qtdItens', 'qtdParcelas'];
           if (numericFields.includes(field)) {
             const numV = parseFloat(value as string);
             if (!isNaN(numV)) query = query.eq(dbColumn, numV);
           } else if (!dbColumn.includes('.')) { 
             query = query.ilike(dbColumn, `%${value}%`);
           }
        }
      });
    }

    const { data, error, count } = await (omieId 
      ? query 
      : query.order(sortField, { ascending: sortOrder === 'asc' }).range(from, to)
    );

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
          codProj: 0
        },
        infoCadastro: {
          dFat: nf?.DataEmissao || '',
          dInc: order.DataInclusao || order.CreatedAt,
          uInc: order.UsuarioInclusao,
          dAlt: order.UpdatedAt,
          uAlt: order.UsuarioAlteracao,
          // RECUPERANDO O NÚMERO DA NOTA FISCAL
          numero_nfe: nf?.NumeroNf || '',
          serie_nfe: nf?.Serie || '',
          valor_total_nfe: num(nf?.ValorTotal),
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
