import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { mapSupabaseToCliente } from './clientes-mapper.ts';
import { mapSupabaseToFinanceiro } from './financeiro-mapper.ts';
import { mapSupabaseToProduto } from './produtos-mapper.ts';
import { mapOrderToFlatVendas } from './vendas-mapper.ts';

describe('Omie contract mappers', () => {
  test('keeps the Omie customer integration code and unpacks the stored telephone', () => {
    const customer = mapSupabaseToCliente({
      id: 'internal-uuid',
      omie_id: 21,
      codigo_cliente_integracao: 'CLIENT-21',
      telefone: '(11) 98888-7777',
    });

    assert.strictEqual(customer.codigo_cliente_integracao, 'CLIENT-21');
    assert.strictEqual(customer.telefone1_ddd, '11');
    assert.strictEqual(customer.telefone1_numero, '98888-7777');
  });

  test('does not expose the Supabase UUID as a product integration code', () => {
    const product = mapSupabaseToProduto({
      id: 'internal-uuid',
      omie_id: 84,
      codigo_produto: 'SKU-84',
      codigo_produto_integracao: 'PRODUCT-84',
      peso_liquido: 1.25,
      familia_produto: 'Ferramentas',
      ativo: true,
    });

    assert.strictEqual(product.codigo_produto_integracao, 'PRODUCT-84');
    assert.strictEqual(product.peso_liquido, 1.25);
    assert.strictEqual(product.familia_produto, 'Ferramentas');
  });

  test('leaves payment totals unknown when the Omie list response omits them', () => {
    const title = mapSupabaseToFinanceiro({
      id: 'title-1',
      valor_documento: 100,
      valor_pago: null,
      valor_saldo: null,
      status_titulo: 'A VENCER',
    }, 'pagar');

    assert.strictEqual(title.valor_pago_recebido, null);
    assert.strictEqual(title.valor_saldo, null);
  });

  test('uses the order inclusion date and the Omie faturado flag', () => {
    const [order] = mapOrderToFlatVendas({
      cabecalho: {
        codigo_pedido: 10,
        numero_pedido: '10',
        etapa: '50',
        data_previsao: '2026-10-15',
      },
      infoCadastro: {
        dInc: '2026-09-10T12:00:00.000Z',
        faturado: 'S',
      },
      det: [{ produto: { descricao: 'Item', valor_total: 25 } }],
    });

    assert.strictEqual(order.data, '2026-09-10T12:00:00.000Z');
    assert.strictEqual(order.dataPedido, '2026-09-10T12:00:00.000Z');
    assert.strictEqual(order.vencimentoStatus, 'Faturado');
  });

  for (const etapa of ['50', '90']) {
    for (const faturado of ['N', undefined] as const) {
      test(`does not infer billing from stage ${etapa} when the flag is ${faturado ?? 'missing'}`, () => {
        const [order] = mapOrderToFlatVendas({
          cabecalho: { etapa },
          infoCadastro: { faturado },
          det: [{ produto: { descricao: 'Item' } }],
        });

        assert.strictEqual(order.vencimentoStatus, etapa);
      });
    }
  }

  test('marks an unbilled order with an overdue installment as late', () => {
    const [order] = mapOrderToFlatVendas({
      cabecalho: { etapa: '50' },
      infoCadastro: { faturado: 'N' },
      lista_parcelas: { parcela: [{ data_vencimento: '01/01/2000' }] },
      det: [{ produto: { descricao: 'Item' } }],
    });

    assert.strictEqual(order.vencimentoStatus, 'Atrasado');
  });

  for (const type of ['pagar', 'receber'] as const) {
    test(`preserves missing amounts as null and explicit zero amounts for ${type}`, () => {
      const missing = mapSupabaseToFinanceiro({ id: 'missing' }, type);
      const zero = mapSupabaseToFinanceiro({
        id: 'zero',
        valor_pago: 0,
        valor_recebido: '0',
        valor_saldo: 0,
      }, type);

      assert.strictEqual(missing.valor_pago_recebido, null);
      assert.strictEqual(missing.valor_saldo, null);
      assert.strictEqual(zero.valor_pago_recebido, 0);
      assert.strictEqual(zero.valor_saldo, 0);
    });
  }
});
