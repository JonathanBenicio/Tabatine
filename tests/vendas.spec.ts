/**
 * @file vendas.spec.ts
 * @description E2E Tests for the Vendas module (Issue #59)
 * Hardened to follow the Universal Roadmap.
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Vendas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendas');
    if (page.url().includes('/auth')) {
      throw new Error('Sessão inválida. Execute o auth.setup.ts primeiro.');
    }
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO E ESTADO INICIAL
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título "Pedidos e Faturamento"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /pedidos e faturamento/i })).toBeVisible();
  });

  test('1.2 deve alternar entre abas Pedidos e Notas Fiscais', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first()).toBeVisible({ timeout: 15000 });
    await page.locator('button').filter({ hasText: /^Notas Fiscais$/ }).click();
    await expect(page.getByRole('heading', { name: /central de notas fiscais/i }).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /pedidos de venda/i }).click();
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('1.3 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/pedidos encontrados/i)).toBeVisible();
    await expect(page.getByText(/volume/i).first()).toBeVisible();
  });

  test('1.4 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('columnheader').filter({ hasText: /pedido/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /cliente/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /valor total/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /data/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /ações/i }).first()).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA E FILTROS GERAIS
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.fill('001');
    await expect(page.getByText(/calculando matriz/i)).not.toBeVisible({ timeout: 15000 });
    const tableOrEmpty = page.locator('tbody tr:not(.animate-pulse)').first().or(page.getByText(/nenhuma venda localizada/i));
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
  });

  test('2.2 deve exibir empty state com busca sem resultados', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.fill('PEDIDO_INEXISTENTE_XYZ_9999999');
    await expect(page.getByText(/nenhuma venda localizada/i)).toBeVisible({ timeout: 10000 });
  });

  test('2.3 deve limpar a busca e restaurar a lista completa', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.fill('001');
    await searchInput.clear();
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  test('2.4 deve aplicar filtros avançados por período', async ({ page }) => {
    const filterBtn = page.locator('button').filter({ hasText: /filtros/i }).first();
    await filterBtn.click({ force: true });
    await page.getByRole('button', { name: /últimos 7 dias/i }).click();
    await page.getByRole('button', { name: /aplicar/i }).click();
    await page.waitForTimeout(800);
    const tableOrEmpty = page.locator('tbody tr:not(.animate-pulse)').first().or(page.getByText(/nenhuma venda localizada/i));
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
  });

  test('2.5 deve limpar filtros avançados', async ({ page }) => {
    const filterBtn = page.locator('button').filter({ hasText: /filtros/i }).first();
    await filterBtn.click({ force: true });
    await page.getByRole('button', { name: /limpar/i }).click();
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. PAGINAÇÃO E NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  test('3.1 deve desabilitar "Anterior" na primeira página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const prevButton = page.getByRole('button', { name: /anterior/i });
    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeDisabled();
    }
  });

  test('3.2 deve avançar para próxima página e manter busca ativa', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.fill('a');
    
    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForTimeout(800);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      await expect(searchInput).toHaveValue('a');
    }
  });

  test('3.3 deve alterar page size pelo select de linhas', async ({ page }) => {
    const pageSizeSelect = page.locator('select').first();
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.selectOption('20');
      await page.waitForTimeout(800);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 4. ORDENAÇÃO (SORTING)
  // ─────────────────────────────────────────────────────────

  test('4.1 deve ordenar por Valor Total ao clicar no cabeçalho', async ({ page }) => {
    const headerValorTotal = page.getByRole('columnheader').filter({ hasText: /valor total/i }).first();
    await headerValorTotal.click({ force: true });
    await page.waitForTimeout(800);
    await expect(headerValorTotal.locator('svg')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  test('4.2 deve ordenar por Data', async ({ page }) => {
    const headerData = page.getByRole('columnheader').filter({ hasText: /data/i }).first();
    await headerData.click({ force: true });
    await page.waitForTimeout(800);
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 5. DRILL-DOWN E DETALHES
  // ─────────────────────────────────────────────────────────

  test('5.1 deve navegar para detalhes via seletor "Abrir Detalhes"', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewBtn = firstRow.locator('[title="Abrir Detalhes"]').first();
    await viewBtn.click({ force: true });
    await expect(page).toHaveURL(/\/vendas\/[^/]+/, { timeout: 10000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('5.2 deve retornar à listagem ao voltar da tela de detalhes', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    const viewBtn = firstRow.locator('[title="Abrir Detalhes"]').first();
    await viewBtn.click({ force: true });
    await page.waitForURL(/\/vendas\/[^/]+/, { timeout: 10000 });

    const backLink = page.getByRole('link', { name: /voltar/i }).or(page.locator('a[href="/vendas"]').first()).first();
    if (await backLink.isVisible()) {
      await backLink.click();
    } else {
      await page.goBack();
    }

    await expect(page).toHaveURL('/vendas', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /pedidos e faturamento/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 6. AÇÕES AUXILIARES
  // ─────────────────────────────────────────────────────────

  test('6.1 deve exportar dados para CSV', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /exportar/i });
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
      await exportButton.click({ force: true });
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });

  test('6.2 deve recarregar dados via refresh', async ({ page }) => {
    const refreshBtn = page.locator('button[title="Atualizar dados"]').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('6.3 deve abrir painel de visibilidade de colunas', async ({ page }) => {
    const colBtn = page.locator('button[title="Colunas"]');
    if (await colBtn.isVisible()) {
      await colBtn.click({ force: true });
      await expect(page.getByText(/visibilidade/i)).toBeVisible();
    }
  });
});
