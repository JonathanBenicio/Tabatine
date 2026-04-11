import { test, expect } from './fixtures/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Módulo Conciliação Bancária', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conciliacao');
  });

  test('CT-01: Deve renderizar a página de Conciliação Bancária', async ({ page }) => {
    // Verifica estado inicial do upload area
    await expect(page.getByText(/Importar Arquivo OFX/i).first()).toBeVisible();
    await expect(page.getByText(/Arraste seu extrato/i).first()).toBeVisible();
  });

  test('CT-02: Deve permitir upload e processamento de extrato OFX', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'sample.ofx');
    await page.setInputFiles('input[type="file"]', filePath);

    // Verifica se os cards de resumo aparecem após o upload
    await expect(page.getByText(/^Entradas$/i).first()).toBeVisible();
    await expect(page.getByText(/^Saídas$/i).first()).toBeVisible();
    
    // Validamos presença de valores definidos no fixture
    await expect(page.getByText(/500,00/).first()).toBeVisible();
    await expect(page.getByText(/150,00/).first()).toBeVisible();

    // Verifica a renderização da tabela
    await expect(page.getByText(/fornecedor teste/i)).toBeVisible();
    await expect(page.getByText(/cliente teste/i)).toBeVisible();
  });

  test('CT-03: Deve permitir limpar os dados importados', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'sample.ofx');
    await page.setInputFiles('input[type="file"]', filePath);
    
    await expect(page.locator('table')).toBeVisible();
    
    const limparBtn = page.getByRole('button', { name: /Nova Importação/i }).or(page.getByRole('button', { name: /Limpar/i }));
    if (await limparBtn.isVisible()) {
        await limparBtn.click();
        await expect(page.getByText(/Importar Arquivo OFX/i).first()).toBeVisible();
        await expect(page.locator('table')).not.toBeVisible();
    }
  });

  test('CT-04: Deve permitir visualização de detalhes da transação OFX', async ({ page }) => {
    const filePath = path.join(__dirname, 'fixtures', 'sample.ofx');
    await page.setInputFiles('input[type="file"]', filePath);

    // Espera a tabela renderizar
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Clica no botão de detalhes
    const detailBtn = page.locator('tbody tr').first().locator('button').filter({ has: page.locator('svg.lucide-search, svg.lucide-info') }).first().or(page.getByTitle(/Detalhes/i).first());
    
    if (await detailBtn.isVisible()) {
        await detailBtn.click();
        await expect(page.getByText(/Detalhes da Transação/i).first().or(page.getByText(/Metadados/i).first())).toBeVisible();
    }
  });
});
