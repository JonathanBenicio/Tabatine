import { test, describe } from 'node:test';
import assert from 'node:assert';
import { categorize, CATEGORY_MAP } from './ofxParser.ts';

describe('ofxParser - categorize', () => {
  test('should categorize keywords correctly', () => {
    assert.strictEqual(categorize('UBER CORRIDA'), 'Transporte');
    assert.strictEqual(categorize('COMPRA NO IFOOD'), 'Alimentação');
    assert.strictEqual(categorize('PAGAMENTO LUZ'), 'Serviços / Utilidades');
    assert.strictEqual(categorize('IOF MENSAL'), 'Taxas e Impostos');
    assert.strictEqual(categorize('NETFLIX SUBSCRIPTION'), 'Lazer');
    assert.strictEqual(categorize('FARMACIA PRECO BAIXO'), 'Saúde');
    assert.strictEqual(categorize('RECEBIMENTO SALARIO'), 'Renda / Transferência');
  });

  test('should be case insensitive', () => {
    assert.strictEqual(categorize('uber'), 'Transporte');
    assert.strictEqual(categorize('Ifood'), 'Alimentação');
    assert.strictEqual(categorize('lUz'), 'Serviços / Utilidades');
  });

  test('should handle partial matches within words', () => {
    assert.strictEqual(categorize('SUPERMERCADO'), 'Alimentação');
    assert.strictEqual(categorize('MERCADO'), 'Alimentação');
  });

  test('should return "Outros" when no keyword matches', () => {
    assert.strictEqual(categorize('COMPRA DESCONHECIDA'), 'Outros');
    assert.strictEqual(categorize(''), 'Outros');
  });

  test('should prioritize categories based on order in CATEGORY_MAP', () => {
    // If a description matches keywords from multiple categories,
    // it should return the first one found in CATEGORY_MAP.
    // UBER (Transporte) and IFOOD (Alimentação)
    // In CATEGORY_MAP, Transporte comes before Alimentação.
    assert.strictEqual(categorize('UBER IFOOD'), 'Transporte');
  });

  test('should verify all keywords in CATEGORY_MAP', () => {
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      for (const keyword of keywords) {
        assert.strictEqual(categorize(keyword), category, `Keyword "${keyword}" should map to category "${category}"`);
      }
    }
  });
});
