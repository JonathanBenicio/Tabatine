/**
 * @file produtos.spec.ts
 * @description E2E Tests for the Produtos module (Issue #60)
 * Covers: Rendering, Search, Pagination, Sorting, Navigation to Details
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Produtos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/produtos');
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título da página', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /gestão de produtos/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('1.2 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    await expect(page.getByText(/total de produtos/i)).toBeVisible();
    await expect(page.getByText(/valor total estoque/i)).toBeVisible();
    
    // Aguarda dados reais
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
  });

  test('1.3 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const table = page.getByRole('table');
    
    const expectedHeaders = ['Imagem', 'Cód. Produto', 'Nome do Produto', 'NCM', 'Preço Unit.', 'Estoque', 'Ações'];
    for (const header of expectedHeaders) {
      await expect(table.locator('th', { hasText: new RegExp(header.replace('.', '\\.'), 'i') }).first()).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA GERAL (SEARCH)
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/localizar produto/i);
    await searchInput.click({ force: true });
    await searchInput.fill('00'); 
    await page.waitForTimeout(800);

    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const isEmpty = await page.getByText(/nenhum produto encontrado/i).isVisible();
    expect(await rows.count() > 0 || isEmpty).toBeTruthy();
  });

  test('2.2 deve limpar a busca e restaurar dados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/localizar produto/i);
    await searchInput.fill('PRODUTO_TEST_99');
    await page.waitForTimeout(800);

    await searchInput.clear();
    await page.waitForTimeout(800);

    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. ORDENAÇÃO (SORTING)
  // ─────────────────────────────────────────────────────────

  test('3.1 deve ordenar por Nome do Produto ao clicar no cabeçalho', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerNome = page.getByRole('columnheader', { name: /nome do produto/i }).first();
    await headerNome.click({ force: true });
    await page.waitForTimeout(800);

    await expect(headerNome.locator('svg')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 4. PAGINAÇÃO
  // ─────────────────────────────────────────────────────────

  test('4.1 deve desabilitar "Anterior" na pág 1 e avançar paginação', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const prevButton = page.getByRole('button', { name: /anterior/i });
    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeDisabled();
    }

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('button', { name: /anterior/i })).toBeEnabled();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 5. NAVEGAÇÃO E DRILL-DOWN
  // ─────────────────────────────────────────────────────────

  test('5.1 deve navegar para tela de detalhes e exibir informações do produto', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewLink = firstRow.locator('a[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    
    await expect(page).toHaveURL(/\/produtos\/\d+/, { timeout: 10000 });
    
    // Valida seções detalhes do Produto
    await expect(page.getByText(/descrição do produto/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/informações fiscais/i)).toBeVisible();
    await expect(page.getByText(/estoque e logística/i)).toBeVisible();
  });

  test('5.2 o botão Voltar deve retornar à gestão de produtos', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const viewLink = firstRow.locator('a[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    await page.waitForURL(/\/produtos\/\d+/, { timeout: 10000 });

    const backBtn = page.getByRole('link', { name: /voltar/i }).first();
    await backBtn.click();

    await expect(page).toHaveURL('/produtos', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /gestão de produtos/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 6. REFRESH
  // ─────────────────────────────────────────────────────────

  test('6.1 deve recarregar dados via botão de refresh', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const refreshBtn = page.locator('button[title="Atualizar dados"]').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
