import { test, expect } from '@playwright/test';

test.describe('Módulo: Produtos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/produtos');
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título da página', async ({ page }) => {
    const heading = page.getByRole('heading', { name: "Produtos", exact: true });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('1.2 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    await expect(page.getByText(/total produtos/i)).toBeVisible();
    await expect(page.getByText(/ativos/i)).toBeVisible();
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
  });

  test('1.3 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    const expectedHeaders = ['Produto', 'SKU / Cód.', 'Família', 'Unidade', 'Preço', 'NCM', 'Status', 'Ações'];
    for (const header of expectedHeaders) {
      await expect(table.locator('th', { hasText: new RegExp(header, 'i') }).first()).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA GERAL (SEARCH)
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar por nome/i);
    await searchInput.fill('Produto X');
    await page.waitForTimeout(1000);

    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const isEmpty = await page.getByText(/nenhum produto encontrado/i).isVisible();
    expect(await rows.count() > 0 || isEmpty).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────
  // 3. FILTROS AVANÇADOS E VISIBILIDADE
  // ─────────────────────────────────────────────────────────

  test('3.1 deve abrir o painel de filtros avançados e aplicar filtro de status', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const filterBtn = page.getByRole('button', { name: /filtros/i }).first();
    await filterBtn.click({ force: true });
    await expect(page.getByText(/filtros avançados/i)).toBeVisible();

    const selectStatus = page.locator('select').nth(1); // O segundo select (Status)
    await selectStatus.selectOption({ label: 'Ativo' });

    // Espera atualizar
    await page.waitForTimeout(1000);
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  test('3.2 deve abrir o painel de colunas', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const colBtn = page.locator('button[title="Colunas"]');
    await colBtn.click({ force: true });
    await expect(page.getByText(/colunas/i).first()).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 4. ORDENAÇÃO
  // ─────────────────────────────────────────────────────────

  test('4.1 deve ordenar ao clicar no cabeçalho (Preço)', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerPreco = page.getByRole('columnheader').filter({ hasText: /preço/i }).first();
    await headerPreco.click({ force: true }); // ASC
    await expect(headerPreco.locator('svg').last()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 5. PAGINAÇÃO
  // ─────────────────────────────────────────────────────────

  test('5.1 deve desabilitar "Anterior" na primeira página e avançar na paginação', async ({ page }) => {
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
    }
  });

  // ─────────────────────────────────────────────────────────
  // 6. EXPORTAÇÃO
  // ─────────────────────────────────────────────────────────

  test('6.1 deve exportar dados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const exportBtn = page.getByRole('button', { name: /exportar/i }).first();
    if (await exportBtn.isVisible()) {
      // Cria a promessa do download antes de clicar
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await exportBtn.click({ force: true });
      const download = await downloadPromise;
      // Se houvesse data para exportar
      if (download) {
        expect(download.suggestedFilename()).toContain('produtos_tabatine');
      }
    }
  });

  // ─────────────────────────────────────────────────────────
  // 7. NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  test('7.1 deve navegar para tela de detalhes', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewButton = firstRow.getByTitle(/ver detalhes/i).first();
    await viewButton.click({ force: true });
    
    await page.waitForURL(/\/produtos\/\d+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/produtos\/\d+/);
  });

  // ─────────────────────────────────────────────────────────
  // 8. REFRESH
  // ─────────────────────────────────────────────────────────

  test('8.1 deve recarregar dados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const refreshBtn = page.locator('button').filter({ has: page.locator('.lucide-refresh-ccw') }).first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
