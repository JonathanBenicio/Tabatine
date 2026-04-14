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

    // Map frontend field name to DB column name for filtering/sorting
    const VENDA_COLUMN_MAP: Record<string, string> = {
      data: 'data_inclusao',
      pedido: 'numero_pedido',
      numeroPedido: 'numero_pedido',
      cliente: 'clientes.nome_fantasia',
      vendedor: 'vendedores.nome',
      valorTotal: 'valor_total',
      etapa: 'etapa',
      nf: 'notas_fiscais.numero_nf',
      formaPg: 'meio_pagamento',
      banco: 'contas_corrente.descricao',
      vencimentoStatus: 'etapa',
      produto: 'itens_pedido.produtos.descricao',
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

    const searchFilterIds: { cliente?: string[]; vendedor?: string[]; banco?: string[] } = {};

    if (search || activeFilters.some(f => ['cliente', 'vendedor', 'banco'].includes(f.field))) {
      const escapedSearch = escapeFilterValue(`%${search}%`);
      
      // Lookup Clientes matching search or specific client filter
      const clientFilter = activeFilters.find(f => f.field === 'cliente');
      if (search || clientFilter) {
        let clientQuery = supabase.from('clientes').select('id');
        if (clientFilter) {
          clientQuery = clientQuery.ilike('nome_fantasia', `%${clientFilter.value}%`);
        } else {
          clientQuery = clientQuery.or(`razao_social.ilike.${escapedSearch},nome_fantasia.ilike.${escapedSearch},nome.ilike.${escapedSearch}`);
        }
        const { data: cData } = await clientQuery;
        if (cData) searchFilterIds.cliente = cData.map(c => (c as Record<string, unknown>).id as string);
      }

      // Lookup Vendedores matching search or specific vendor filter
      const vendorFilter = activeFilters.find(f => f.field === 'vendedor');
      if (search || vendorFilter) {
        let vendorQuery = supabase.from('vendedores').select('id');
        if (vendorFilter) {
          vendorQuery = vendorQuery.ilike('nome', `%${vendorFilter.value}%`);
        } else {
          vendorQuery = vendorQuery.ilike('nome', escapedSearch);
        }
        const { data: vData } = await vendorQuery;
        if (vData) searchFilterIds.vendedor = vData.map(v => (v as Record<string, unknown>).id as string);
      }

      // Lookup Bancos matching banco filter
      const bancoFilter = activeFilters.find(f => f.field === 'banco');
      if (bancoFilter) {
        const { data: bData } = await supabase.from('contas_corrente').select('id').ilike('descricao', `%${bancoFilter.value}%`);
        if (bData) searchFilterIds.banco = bData.map(b => (b as Record<string, unknown>).id as string);
      }
    }

    let query = supabase
      .from('pedidos_venda')
      .select(`
        *,
        clientes (*),
        vendedores (*),
        contas_corrente (*),
        formas_pagamento (*),
        itens_pedido (*, produtos (*)),
        pedido_parcelas (*),
        notas_fiscais (*)
      `, { count: 'exact' });

    if (omieId) {
      query = query.eq('omie_id', parseInt(omieId));
    } else {
      if (clienteOmieId) query = query.eq('clientes.omie_id', parseInt(clienteOmieId));
      if (vendedorOmieId) query = query.eq('vendedores.omie_id', parseInt(vendedorOmieId));
      if (contaCorrenteId) query = query.eq('contas_corrente.omie_id', parseInt(contaCorrenteId));

      if (startDate) query = query.gte('data_inclusao', startDate);
      if (endDate) query = query.lte('data_inclusao', endDate);

      // Apply search across matches or NumeroPedido
      if (search) {
        const escapedSearch = escapeFilterValue(`%${search}%`);
        const orConditions = [`numero_pedido.ilike.${escapedSearch}`];
        if (searchFilterIds.cliente?.length) orConditions.push(`cliente_id.in.(${searchFilterIds.cliente.join(',')})`);
        if (searchFilterIds.vendedor?.length) orConditions.push(`vendedor_id.in.(${searchFilterIds.vendedor.join(',')})`);
        query = query.or(orConditions.join(','));
      }

      // Apply column filters
      const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';
      activeFilters.forEach(({ field, value }) => {
        if (field === 'cliente') {
           if (searchFilterIds.cliente?.length) query = query.in('cliente_id', searchFilterIds.cliente);
           else if (value) query = query.eq('cliente_id', EMPTY_UUID);
        } else if (field === 'vendedor') {
           if (searchFilterIds.vendedor?.length) query = query.in('vendedor_id', searchFilterIds.vendedor);
           else if (value) query = query.eq('vendedor_id', EMPTY_UUID);
        } else if (field === 'banco') {
           if (searchFilterIds.banco?.length) query = query.in('conta_corrente_id', searchFilterIds.banco);
           else if (value) query = query.eq('conta_corrente_id', EMPTY_UUID);
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

    // Fixed Sorting Logic for Relationships
    let finalQuery = query;
    if (!omieId) {
      if (sortField.includes('.')) {
        const parts = sortField.split('.');
        const column = parts.pop()!;
        const table = parts.join('.');
        finalQuery = query.order(column, { referencedTable: table, ascending: sortOrder === 'asc' });
      } else {
        finalQuery = query.order(sortField, { ascending: sortOrder === 'asc' });
      }
      finalQuery = finalQuery.range(from, to);
    }

    const { data, error, count } = await finalQuery;

    if (error) {
      throw error;
    }

    const num = (v: unknown) => v === null || v === undefined ? 0 : Number(v);

    const mappedData = (data || []).map((order: Record<string, unknown>) => {
      const itens = (order.itens_pedido as any) || [];
      const nf = (order.notas_fiscais as any || [])[0];

      return {
        cabecalho: {
          codigo_pedido: order.omie_id,
          numero_pedido: order.numero_pedido,
          etapa: order.etapa,
          data_pedido: order.data_inclusao || order.created_at,
          data_previsao: order.data_previsao,
          codigo_cliente: (order as any).clientes?.omie_id,
          codigo_parcela: order.codigo_parcela,
          meio_pagamento: (order as any).formas_pagamento?.descricao || order.meio_pagamento || '',
          quantidade_itens: itens.length,
          qtde_parcelas: order.quantidade_parcelas || 0,
          faturado: order.faturado ? 'S' : 'N',
          devolvido: order.devolvido ? 'S' : 'N'
        },
        det: (itens as any[]).map((item: any) => ({
          produto: {
            codigo: item.produtos?.codigo_produto,
            descricao: item.produtos?.descricao,
            unidade: item.unidade_medida || item.produtos?.unidade_medida || 'UN',
            valor_unitario: num(item.valor_unitario),
            quantidade: num(item.quantidade),
            valor_total: num(item.valor_total),
            percentual_desconto: num(item.percentual_desconto),
            valor_desconto: num(item.valor_desconto),
            ncm: item.produtos?.ncm,
            cfop: item.cfop || '--',
          },
          imposto: {
            icms: {
              valor_icms: num(item.valor_icms),
              base_calculo: num(item.base_icms),
              aliquota: num(item.aliq_icms),
              cst: item.cst_icms
            },
            ipi: {
              valor_ipi: num(item.valor_ipi),
              base_calculo: num(item.base_ipi),
              aliquota: num(item.aliq_ipi),
              cst: item.cst_ipi
            },
            pis_padrao: {
              valor_pis: num(item.valor_pis),
              base_calculo: num(item.base_pis),
              aliquota: num(item.aliq_pis),
              cst: item.cst_pis
            },
            cofins_padrao: {
              valor_cofins: num(item.valor_cofins),
              base_calculo: num(item.base_cofins),
              aliquota: num(item.aliq_cofins),
              cst: item.cst_cofins
            },
            ibs: {
              valor_ibs: num(item.valor_ibs),
              aliquota_ibs_uf: num(item.aliq_ibs),
              base_ibs_cbs: num(item.base_ibs_cbs)
            },
            cbs: {
              valor_cbs: num(item.valor_cbs),
              aliquota_cbs: num(item.aliq_cbs),
              base_ibs_cbs: num(item.base_ibs_cbs)
            }
          },
          ide: {
            codigo_item: item.omie_id
          }
        })),
        lista_parcelas: {
          parcela: (order.pedido_parcelas as Record<string, unknown>[] || []).map((p: Record<string, unknown>) => ({
            numero_parcela: p.numero_parcela,
            valor: num(p.valor),
            data_vencimento: p.data_vencimento,
            percentual: num(p.percentual),
            categoria: p.categoria || '',
            nsu: p.nsu || '',
            meio_pagamento: ''
          }))
        },
        informacoes_adicionais: {
          codVend: (order as any).vendedores?.omie_id,
          vendedor_nome: (order as any).vendedores?.nome,
          codigo_conta_corrente: (order as any).contas_corrente?.omie_id,
          conta_corrente_nome: (order as any).contas_corrente?.descricao || '',
          perc_comissao: num(order.comissao_vendedor),
          contato: order.contato,
          numero_pedido_cliente: order.numero_pedido_cliente || '',
          consumidor_final: order.consumidor_final || '',
          codProj: 0
        },
        infoCadastro: {
          dFat: nf?.data_emissao || '',
          dInc: order.data_inclusao || order.created_at,
          uInc: order.usuario_inclusao,
          dAlt: order.updated_at,
          uAlt: order.usuario_alteracao,
          numero_nfe: nf?.numero_nf || '',
          serie_nfe: nf?.serie || '',
          valor_total_nfe: num(nf?.valor_total),
          chave_nfe: nf?.chave_acesso || '',
          cancelado: order.cancelado ? 'S' : 'N',
          autorizado: order.autorizado ? 'S' : 'N',
          denegado: order.denegado ? 'S' : 'N',
          cliente_nome: (order as any).clientes?.razao_social || (order as any).clientes?.nome_fantasia
        },
        total_pedido: {
          valor_total_pedido: num(order.valor_total),
          valor_mercadorias: num(order.valor_mercadorias),
          valor_descontos: num(order.valor_desconto || 0),
          valor_icms: num(order.valor_icms),
          valor_IPI: num(order.valor_ipi),
          valor_pis: num(order.valor_pis),
          valor_cofins: num(order.valor_cofins),
          base_calculo_icms: num(order.base_calculo_icms),
          valor_iss: num(order.valor_iss || 0),
          valor_ir: num(order.valor_ir || 0),
          valor_csll: num(order.valor_csll || 0),
          valor_inss: num(order.valor_inss || 0),
          valor_ibs: num(order.valor_ibs || 0),
          valor_cbs: num(order.valor_cbs || 0),
        },
        frete: {
          valor_frete: num(order.valor_frete),
          quantidade_volumes: num(order.quantidade_volumes),
          codigo_transportadora: order.transportadora,
          peso_bruto: num(order.peso_bruto),
          peso_liquido: num(order.peso_liquido),
          previsao_entrega: order.previsao_entrega || '',
          modalidade: order.frete_modalidade || '',
          codigo_rastreio: order.codigo_rastreio || '',
          link_rastreio: order.link_rastreio || '',
          veiculo_proprio: order.veiculo_proprio || '',
          placa: order.placa || '',
          valor_seguro: num(order.valor_seguro || 0),
          outras_despesas: num(order.valor_outras_despesas || 0)
        },
        observacoes: {
          obs_venda: order.observacoes_venda,
          obs_interna: order.observacoes_internas,
          obs_nf: order.dados_adicionais_nf || nf?.informacoes_complementares,
          obs_nf_fisco: nf?.informacoes_fisco
        }
      };
    });    

    return NextResponse.json({
      pedido_venda_produto: mappedData,
      total_de_paginas: Math.ceil((count || 0) / limit),
      total_de_registros: count,
      pagina: page
    });
  } catch (error: unknown) {
    console.error('API Error (Supabase Vendas):', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
