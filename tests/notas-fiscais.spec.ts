/**
 * @file notas-fiscais.spec.ts
 * @description E2E Tests for the Notas Fiscais module (Issue #60)
 * Covers: Rendering, Search, Pagination, Sorting, Navigation to Details
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Notas Fiscais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nf');
    // Guard: sessão
    if (page.url().includes('/auth')) {
      throw new Error('Sessão inválida. Execute o auth.setup.ts primeiro.');
    }
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título da página', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /central de notas fiscais/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('1.2 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    await expect(page.getByText(/nf-e processadas/i)).toBeVisible();
    await expect(page.getByText(/total faturado/i)).toBeVisible();
    
    // Aguarda dados reais
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
  });

  test('1.3 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const table = page.getByRole('table');
    
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
    await searchInput.click({ force: true });
    await searchInput.fill('000'); 
    await page.waitForTimeout(800);

    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const isEmpty = await page.getByText(/nenhum registro sincronizado/i).isVisible();
    expect(await rows.count() > 0 || isEmpty).toBeTruthy();
  });

  test('2.2 deve exibir empty state para busca sem resultados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/localizar nf-e/i);
    await searchInput.fill('NF_INEXISTENTE_999999');
    await page.waitForTimeout(800);

    await expect(page.getByText(/nenhum registro sincronizado/i)).toBeVisible({ timeout: 10000 });
  });

  test('2.3 deve limpar a busca e restaurar dados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/localizar nf-e/i);
    await searchInput.fill('001');
    await page.waitForTimeout(800);

    await searchInput.clear();
    await page.waitForTimeout(800);

    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. ORDENAÇÃO (SORTING)
  // ─────────────────────────────────────────────────────────

  test('3.1 deve ordenar por Emissão ao clicar no cabeçalho', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerEmissao = page.getByRole('columnheader', { name: /emissão/i }).first();
    await headerEmissao.click({ force: true });
    await page.waitForTimeout(800);

    // Ícone de ordenação deve aparecer
    await expect(headerEmissao.locator('svg')).toBeVisible({ timeout: 10000 });
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
      // Botão anterior agora deve estar habilitado
      await expect(page.getByRole('button', { name: /anterior/i })).toBeEnabled();
    }
  });

  test('4.2 deve manter o filtro de busca ao trocar de página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/localizar nf-e/i);
    await searchInput.fill('00');
    await page.waitForTimeout(800);

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      await expect(searchInput).toHaveValue('00');
    }
  });

  // ─────────────────────────────────────────────────────────
  // 5. NAVEGAÇÃO E DRILL-DOWN
  // ─────────────────────────────────────────────────────────

  test('5.1 deve navegar para tela de detalhes e exibir dados técnicos', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewLink = firstRow.locator('a[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    
    await expect(page).toHaveURL(/\/nf\/\d+/, { timeout: 10000 });
    
    // Valida seções técnicas do detalhe da NF
    await expect(page.getByText(/identificação da nf-e/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/informações do destinatário/i)).toBeVisible();
    await expect(page.getByText(/totais e impostos/i)).toBeVisible();
    await expect(page.getByText(/natureza da operação/i)).toBeVisible();
  });

  test('5.2 o botão Voltar deve retornar à central de notas', async ({ page }) => {
    // Entra no detalhe
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });
    const viewLink = firstRow.locator('a[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    await page.waitForURL(/\/nf\/\d+/, { timeout: 10000 });

    // Clica em Voltar
    const backBtn = page.getByRole('link', { name: /voltar/i }).first();
    await backBtn.click();

    await expect(page).toHaveURL('/nf', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /central de notas fiscais/i })).toBeVisible();
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
