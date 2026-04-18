/**
 * @file financeiro.spec.ts
 * @description E2E Tests for the Financeiro module (Contas a Pagar and Contas a Receber).
 * Hardened to follow the 5-pillar Universal Roadmap.
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Financeiro (Pagar e Receber)', () => {

  // ─────────────────────────────────────────────────────────
  // SEÇÃO: CONTAS A PAGAR
  // ─────────────────────────────────────────────────────────
  test.describe('Contas a Pagar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/financeiro/pagar');
      await page.waitForLoadState('networkidle');
    });

    // 1. RENDERIZAÇÃO
    test('1.1 deve renderizar título e summary cards de Pagar', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /contas a pagar/i }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/total a pagar/i)).toBeVisible();
      await expect(page.getByText(/títulos vencidos/i)).toBeVisible();
    });

    // 2. BUSCA
    test('2.1 deve filtrar por fornecedor e limpar busca', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/localizar fornecedor/i);
      await expect(searchInput).toBeVisible({ timeout: 15000 });

      await searchInput.click();
      await searchInput.fill('EMPRESA_TESTE_999');
      await page.waitForTimeout(1500);
      await expect(page.getByText(/nenhum título financeiro encontrado/i).first()).toBeVisible({ timeout: 15000 });

      await searchInput.clear();
      await page.waitForTimeout(1000);
    });

    // 3. PAGINAÇÃO
    test('3.1 deve avançar paginação se houver dados suficientes', async ({ page }) => {
      const nextButton = page.getByRole('button', { name: /próxima/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      }
    });

    // 4. ORDENAÇÃO
    test('4.1 deve ordenar por Vencimento ao clicar no cabeçalho', async ({ page }) => {
      const headerVenc = page.getByRole('columnheader', { name: /vencimento/i }).first();
      if (await headerVenc.isVisible()) {
        await headerVenc.click({ force: true });
        await page.waitForTimeout(800);
        await expect(headerVenc.locator('svg')).toBeVisible({ timeout: 10000 });
      }
    });

    // 5. DRILL-DOWN
    test('5.1 deve navegar para página de detalhes e validar conteúdo em Pagar', async ({ page }) => {
      const rows = page.locator('tbody tr:not(.animate-pulse)');
      if (await rows.count() === 0) return;

      const viewButton = rows.first().locator('[title="Abrir Detalhes"]').first();
      await expect(viewButton).toBeVisible();
      await viewButton.click({ force: true });

      // Valida Navegação e URL
      await expect(page).toHaveURL(/\/financeiro\/pagar\/\d+/, { timeout: 10000 });
      
      // Valida Presença de Componentes de Detalhes
      await expect(page.getByText(/dados do título/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/valores e pagamento/i)).toBeVisible();
      await expect(page.getByText(/cronograma/i)).toBeVisible();

      // Testa Botão Voltar (Pilar 5 Checklist)
      const backButton = page.getByRole('button', { name: /voltar/i });
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL(/\/financeiro\/pagar/);
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // SEÇÃO: CONTAS A RECEBER
  // ─────────────────────────────────────────────────────────
  test.describe('Contas a Receber', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/financeiro/receber');
      await page.waitForLoadState('networkidle');
    });

    // 1. RENDERIZAÇÃO
    test('1.1 deve renderizar título e summary cards de Receber', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /contas a receber/i }).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/total a receber/i)).toBeVisible();
      await expect(page.getByText(/títulos em aberto/i)).toBeVisible();
    });

    // 2. BUSCA
    test('2.1 deve filtrar por cliente e limpar busca', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/localizar cliente/i);
      await expect(searchInput).toBeVisible({ timeout: 15000 });

      await searchInput.click();
      await searchInput.fill('CLIENTE_INEXISTENTE_XYZ');
      await page.waitForTimeout(1500);
      await expect(page.getByText(/nenhum título financeiro encontrado/i).first()).toBeVisible({ timeout: 15000 });

      await searchInput.clear();
      await page.waitForTimeout(1000);
    });

    // 3. PAGINAÇÃO
    test('3.1 deve avançar paginação em Receber', async ({ page }) => {
      const nextButton = page.getByRole('button', { name: /próxima/i });
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      }
    });

    // 4. ORDENAÇÃO
    test('4.1 deve ordenar por Cliente ao clicar no cabeçalho', async ({ page }) => {
      const headerCliente = page.getByRole('columnheader', { name: /cliente/i }).first();
      if (await headerCliente.isVisible()) {
        await headerCliente.click({ force: true });
        await page.waitForTimeout(800);
        await expect(headerCliente.locator('svg')).toBeVisible({ timeout: 10000 });
      }
    });

    // 5. DRILL-DOWN
    test('5.1 deve navegar para página de detalhes e validar conteúdo em Receber', async ({ page }) => {
      const rows = page.locator('tbody tr:not(.animate-pulse)');
      if (await rows.count() === 0) return;

      const viewButton = rows.first().locator('[title="Abrir Detalhes"]').first();
      await expect(viewButton).toBeVisible();
      await viewButton.click({ force: true });

      // Valida Navegação e URL
      await expect(page).toHaveURL(/\/financeiro\/receber\/\d+/, { timeout: 10000 });

      // Valida Presença de Componentes de Detalhes
      await expect(page.getByText(/dados do título/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/valores e pagamento/i)).toBeVisible();
      
      // Testa Botão Voltar
      const backButton = page.getByRole('button', { name: /voltar/i });
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page).toHaveURL(/\/financeiro\/receber/);
      }
    });
  });
});
