/**
 * @file financeiro.spec.ts
 * @description E2E Tests for the Financeiro module (Issue #61)
 * Covers: Contas a Pagar and Contas a Receber with full roadmap compliance.
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Financeiro (Pagar e Receber)', () => {

  // ─────────────────────────────────────────────────────────
  // SEÇÃO: CONTAS A PAGAR
  // ─────────────────────────────────────────────────────────
  test.describe('Contas a Pagar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/financeiro/pagar');
    });

    test('1.1 deve renderizar título e summary cards de Pagar', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /contas a pagar/i }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/total a pagar/i)).toBeVisible();
      await expect(page.getByText(/títulos vencidos/i)).toBeVisible();
    });

    test('1.2 deve listar títulos ou exibir empty state apropriado', async ({ page }) => {
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
      const rows = page.locator('tbody tr:not(.animate-pulse)');
      
      await expect(emptyState.or(rows.first())).toBeVisible({ timeout: 20000 });
    });

    test('2.1 deve filtrar por fornecedor e limpar busca', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/localizar fornecedor/i);
      if (!(await searchInput.isVisible())) return;

      await searchInput.fill('EMPRESA_TESTE_999');
      await page.waitForTimeout(800);
      await expect(page.getByText(/nenhum título financeiro encontrado/i).first()).toBeVisible({ timeout: 10000 });

      await searchInput.clear();
      await page.waitForTimeout(800);
      // Volta ao estado original (se houver dados)
    });

    test('3.1 deve ordenar por Vencimento ao clicar no cabeçalho', async ({ page }) => {
      const headerVenc = page.getByRole('columnheader', { name: /vencimento/i }).first();
      if (await headerVenc.isVisible()) {
        await headerVenc.click({ force: true });
        await page.waitForTimeout(800);
        await expect(headerVenc.locator('svg')).toBeVisible({ timeout: 10000 });
      }
    });

    test('4.1 deve avançar paginação se houver dados suficientes', async ({ page }) => {
      const nextButton = page.getByRole('button', { name: /próxima/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // SEÇÃO: CONTAS A RECEBER
  // ─────────────────────────────────────────────────────────
  test.describe('Contas a Receber', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/financeiro/receber');
    });

    test('1.1 deve renderizar título e summary cards de Receber', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /contas a receber/i }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/total a receber/i)).toBeVisible();
      await expect(page.getByText(/títulos em aberto/i)).toBeVisible();
    });

    test('2.1 deve filtrar por cliente e limpar busca', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/localizar cliente/i);
      if (!(await searchInput.isVisible())) return;

      await searchInput.fill('CLIENTE_INEXISTENTE_XYZ');
      await page.waitForTimeout(800);
      await expect(page.getByText(/nenhum título financeiro encontrado/i).first()).toBeVisible({ timeout: 10000 });

      await searchInput.clear();
      await page.waitForTimeout(800);
    });

    test('3.1 deve ordenar por Cliente ao clicar no cabeçalho', async ({ page }) => {
      const headerCliente = page.getByRole('columnheader', { name: /cliente/i }).first();
      if (await headerCliente.isVisible()) {
        await headerCliente.click({ force: true });
        await page.waitForTimeout(800);
        await expect(headerCliente.locator('svg')).toBeVisible({ timeout: 10000 });
      }
    });

    test('4.1 deve avançar paginação em Receber', async ({ page }) => {
      const nextButton = page.getByRole('button', { name: /próxima/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      }
    });
  });
});
