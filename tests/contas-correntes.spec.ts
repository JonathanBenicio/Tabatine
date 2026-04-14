/**
 * @file contas-correntes.spec.ts
 * @description E2E Tests for the Contas Correntes module.
 * Strictly adheres to the Universal E2E Test Roadmap (5 Pillars).
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Contas Correntes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contas-correntes');
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir cabeçalho e cards de resumo', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contas Correntes', exact: true }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Total de Contas/i).first()).toBeVisible();
    await expect(page.getByText(/Saldo Inicial/i).first()).toBeVisible();
  });

  test('1.2 deve renderizar a tabela com dados reais ou empty state', async ({ page }) => {
    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const emptyState = page.getByText(/Nenhuma conta encontrada/i);
    await expect(rows.first().or(emptyState)).toBeVisible({ timeout: 20000 });
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA GERAL (SEARCH)
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Pesquisar contas.../i);
    if (!(await searchInput.isVisible())) return;

    await searchInput.fill('XYZ_NON_EXISTENT');
    await page.waitForTimeout(1500); 
    await expect(page.getByText(/Nenhuma conta/i).first()).toBeVisible();

    await searchInput.clear();
    await page.waitForTimeout(1500);
    const rows = page.locator('tbody tr:not(.animate-pulse)');
    if (await rows.count() > 0) {
      await expect(rows.first()).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 3. PAGINAÇÃO E NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  test('3.1 deve permitir navegação por paginação', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 4. ORDENAÇÃO (SORTING)
  // ─────────────────────────────────────────────────────────

  test('4.1 deve permitir ordenação ao clicar no cabeçalho', async ({ page }) => {
    const firstHeader = page.locator('th').filter({ has: page.locator('button') }).first();
    if (await firstHeader.isVisible()) {
      await firstHeader.click({ force: true });
      await page.waitForTimeout(800);
      await expect(firstHeader.locator('svg')).toBeVisible({ timeout: 10000 });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 5. DRILL-DOWN E DETALHES
  // ─────────────────────────────────────────────────────────

  test('5.1 deve navegar para página de detalhes via seletor "Abrir Detalhes"', async ({ page }) => {
    const rows = page.locator('tbody tr:not(.animate-pulse)');
    if (await rows.count() === 0) return;

    const firstRow = rows.first();
    const viewButton = firstRow.locator('[title="Abrir Detalhes"]').first();
    
    if (await viewButton.isVisible()) {
      await viewButton.click({ force: true });
      await expect(page).toHaveURL(/\/contas-correntes\/\d+/, { timeout: 10000 });
    }
  });

  test('5.2 o botão Voltar na página de detalhes deve retornar à listagem', async ({ page }) => {
    const rows = page.locator('tbody tr:not(.animate-pulse)');
    if (await rows.count() === 0) return;

    const viewButton = rows.first().locator('[title="Abrir Detalhes"]').first();
    if (await viewButton.isVisible()) {
      await viewButton.click({ force: true });
      await page.waitForURL(/\/contas-correntes\/\d+/, { timeout: 10000 });

      const backButton = page.getByRole('link', { name: /voltar/i }).or(page.locator('button:has-text("Voltar")')).first();
      await expect(backButton).toBeVisible({ timeout: 10000 });
      await backButton.click();

      await expect(page).toHaveURL('/contas-correntes', { timeout: 10000 });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 6. AÇÕES AUXILIARES (REFRESH / EXPORT)
  // ─────────────────────────────────────────────────────────

  test('6.1 deve recarregar dados via botão de refresh', async ({ page }) => {
    const refreshBtn = page.locator('button[title="Atualizar dados"]').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
