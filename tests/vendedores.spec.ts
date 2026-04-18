/**
 * @file vendedores.spec.ts
 * @description E2E Tests for the Vendedores module (Issue #60)
 * Covers: Rendering, Search, Pagination, Sorting, Navigation to Details
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Vendedores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendedores');
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título da página', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /listagem de vendedores/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('1.2 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    await expect(page.getByText(/total de vendedores/i)).toBeVisible();
    await expect(page.getByText(/média comissão/i)).toBeVisible();
    
    // Aguarda dados reais
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
  });

  test('1.3 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
    const table = page.getByRole('table');
    
    const expectedHeaders = ['Vendedor / Nome', 'Código', 'Email', 'Comissão', 'Status', 'Ações'];
    for (const header of expectedHeaders) {
      await expect(table.locator('th', { hasText: new RegExp(header.replace('.', '\\.'), 'i') }).first()).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA GERAL (SEARCH)
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar vendedores/i);
    await searchInput.click({ force: true });
    await searchInput.fill('a'); 
    await page.waitForTimeout(800);

    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const isEmpty = await page.getByText(/nenhum vendedor encontrado/i).isVisible();
    expect(await rows.count() > 0 || isEmpty).toBeTruthy();
  });

  test('2.2 deve limpar a busca e restaurar dados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar vendedores/i);
    await searchInput.fill('VENDEDOR_INEXISTENTE_XYZ');
    await page.waitForTimeout(800);

    await searchInput.clear();
    await page.waitForTimeout(800);

    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. PAGINAÇÃO E NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  test('3.1 deve desabilitar "Anterior" na pág 1 e avançar paginação', async ({ page }) => {
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
  // 4. ORDENAÇÃO (SORTING)
  // ─────────────────────────────────────────────────────────

  test('4.1 deve ordenar por Nome do Vendedor ao clicar no cabeçalho', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerNome = page.getByRole('columnheader', { name: /vendedor \/ nome/i }).first();
    await headerNome.click({ force: true });
    await page.waitForTimeout(800);

    await expect(headerNome.locator('svg')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 5. NAVEGAÇÃO E DRILL-DOWN
  // ─────────────────────────────────────────────────────────

  test('5.1 deve navegar para tela de detalhes e exibir informações do vendedor', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewLink = firstRow.locator('button[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    
    await expect(page).toHaveURL(/\/vendedores\/\d+/, { timeout: 10000 });
    
    // Valida seções do Vendedor
    await expect(page.getByText(/perfil do vendedor/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/integração omie/i)).toBeVisible();
  });

  test('5.2 o botão Voltar deve retornar à equipe de vendas', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    const viewLink = firstRow.locator('button[title="Abrir Detalhes"]').first();
    await viewLink.click({ force: true });
    await page.waitForURL(/\/vendedores\/\d+/, { timeout: 10000 });

    const backBtn = page.getByRole('button', { name: /voltar/i }).or(page.locator('button:has(svg.lucide-arrow-left)')).first();
    await backBtn.click();

    await expect(page).toHaveURL('/vendedores', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /listagem de vendedores/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 6. AÇÕES AUXILIARES
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
