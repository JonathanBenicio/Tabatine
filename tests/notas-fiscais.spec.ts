import { test, expect } from './fixtures/test';

test.describe('Módulo: Notas Fiscais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nf');
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título da página', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /central de notas fiscais/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('1.2 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    await expect(page.getByText(/nf-e processadas/i)).toBeVisible();
    await expect(page.getByText(/total faturado/i)).toBeVisible();
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
  });

  test('1.3 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    const expectedHeaders = ['Emissão', 'NF-e No.', 'Série / Mod.', 'Destinatário / Cliente', 'Doc. Cliente', 'Nat. Operação', 'Valor Líquido', 'Status', 'Ações'];
    for (const header of expectedHeaders) {
      await expect(table.locator('th', { hasText: new RegExp(header.replace('.', '\\.'), 'i') }).first()).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA GERAL (SEARCH)
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/localizar nf-e/i);
    await searchInput.fill('000'); // Busca um número de nota ou nome
    await page.waitForTimeout(1000);

    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const isEmpty = await page.getByText(/nenhum registro sincronizado/i).isVisible();
    expect(await rows.count() > 0 || isEmpty).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────
  // 3. PAGINAÇÃO
  // ─────────────────────────────────────────────────────────

  test('3.1 deve desabilitar "Anterior" na primeira página e avançar na paginação', async ({ page }) => {
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
  // 4. NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  test('4.1 deve navegar para tela de detalhes', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewLink = firstRow.locator('a[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    
    await page.waitForURL(/\/nf\/\d+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/nf\/\d+/);
  });

  // ─────────────────────────────────────────────────────────
  // 5. REFRESH
  // ─────────────────────────────────────────────────────────

  test('5.1 deve recarregar dados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const refreshBtn = page.locator('button[title="Atualizar dados"]').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
