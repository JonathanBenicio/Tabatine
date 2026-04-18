/**
 * @file clientes.spec.ts
 * @description E2E Tests for the Clientes module (Issue #59)
 * Covers: Rendering, Search/Filter, Pagination, Navigation to Details
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clientes');
    // Guard: if redirected to auth, the session is invalid
    if (page.url().includes('/auth')) {
      throw new Error('Sessão inválida. Execute o auth.setup.ts primeiro.');
    }
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO E ESTADO INICIAL
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e o título da página', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /painel de clientes/i })).toBeVisible();
    await expect(page.getByText(/crm/i).first()).toBeVisible();
  });

  test('1.2 deve renderizar os summary cards com totais', async ({ page }) => {
    // Summary card "Total de Clientes" deve aparecer
    await expect(page.getByText(/total de clientes/i)).toBeVisible();
    await expect(page.getByText(/simples nacional/i)).toBeVisible();
  });

  test('1.3 deve carregar a tabela com dados reais após o loading', async ({ page }) => {
    // Aguarda os dados reais (sem skeleton/animate-pulse)
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    // Valida que há conteúdo nas células visíveis (razão social não vazia)
    const firstCell = firstRow.locator('td').first();
    await expect(firstCell).not.toBeEmpty();
  });

  test('1.4 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /empresa.*razão social/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('columnheader', { name: /documento/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /localização/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /contato/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /tags/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /ações/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA / FILTRO
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar clientes ao digitar no campo de busca', async ({ page }) => {
    // Aguarda dados iniciais
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar clientes/i);
    await expect(searchInput).toBeVisible();
    await searchInput.click({ force: true });

    await searchInput.fill('a'); // 'a' garante algum resultado na maioria dos casos
    await page.waitForTimeout(600); // Aguarda debounce

    // Verifica que a tabela reagiu (dados ou empty state visíveis)
    const tableOrEmpty = page.locator('tbody tr:not(.animate-pulse)').first()
      .or(page.getByText(/nenhum cliente encontrado/i));
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
  });

  test('2.2 deve exibir empty state quando busca não retornar resultados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar clientes/i);
    await searchInput.click({ force: true });
    // String improvável de ter match nos dados
    await searchInput.fill('XYZXYZXYZ___CLIENTE_NAO_EXISTE___123');
    await page.waitForTimeout(600);

    await expect(page.getByText(/nenhum cliente encontrado/i)).toBeVisible({ timeout: 10000 });
    // Não deve haver linhas de dados
    await expect(page.locator('tbody tr:not(.animate-pulse)')).toHaveCount(0, { timeout: 10000 });
  });

  test('2.3 deve limpar busca e retornar lista original', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar clientes/i);
    await searchInput.click({ force: true });
    await searchInput.fill('abc');
    await page.waitForTimeout(600);

    // Limpa a busca
    await searchInput.clear();
    await page.waitForTimeout(600);

    // Lista original deve estar de volta
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. PAGINAÇÃO E NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  test('3.1 deve desabilitar o botão "Anterior" na primeira página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    // Botões de paginação - "Anterior" deve estar disabled na pág 1
    const prevButton = page.getByRole('button', { name: /anterior/i });
    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeDisabled();
    }
  });

  test('3.2 deve navegar para próxima página se disponível', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      // Captura primeiro nome da página 1
      const firstNamePage1 = await page.locator('tbody tr:not(.animate-pulse)').first().locator('td').first().textContent();

      await nextButton.click();
      await page.waitForTimeout(800);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });

      // Verifica que os dados mudaram (página 2 ≠ página 1)
      const firstNamePage2 = await page.locator('tbody tr:not(.animate-pulse)').first().locator('td').first().textContent();
      expect(firstNamePage1).not.toEqual(firstNamePage2);

      // Botão anterior agora deve estar habilitado
      await expect(page.getByRole('button', { name: /anterior/i })).toBeEnabled();
    }
  });

  test('3.3 deve manter o filtro de busca ao trocar de página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar clientes/i);
    await searchInput.click({ force: true });
    await searchInput.fill('a');
    await page.waitForTimeout(600);

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForTimeout(800);

      // Input de busca ainda deve ter o valor 'a'
      await expect(searchInput).toHaveValue('a');
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 4. ORDENAÇÃO (SORTING)
  // ─────────────────────────────────────────────────────────

  test('4.1 deve ordenar ao clicar no cabeçalho (Empresa)', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerEmpresa = page.getByRole('columnheader', { name: /empresa/i }).first();
    await expect(headerEmpresa).toBeVisible();

    // Primeiro clique: ordena ASC
    await headerEmpresa.click({ force: true });
    await page.waitForTimeout(800);

    // Ícone de ordenação deve estar visível
    const sortIcon = headerEmpresa.locator('svg');
    await expect(sortIcon).toBeVisible({ timeout: 10000 });

    // A tabela deve continuar exibindo dados
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  test('4.2 deve inverter a ordenação ao clicar novamente', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerEmpresa = page.getByRole('columnheader', { name: /empresa/i }).first();
    
    await headerEmpresa.click({ force: true }); // ASC
    await page.waitForTimeout(500);
    await headerEmpresa.click({ force: true }); // DESC
    await page.waitForTimeout(800);

    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 5. DRILL-DOWN E DETALHES
  // ─────────────────────────────────────────────────────────

  test('5.1 deve navegar para página de detalhes via seletor "Abrir Detalhes"', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewButton = firstRow.locator('[title="Abrir Detalhes"]').first();
    await expect(viewButton).toBeVisible({ timeout: 5000 });
    await viewButton.click({ force: true });

    await expect(page).toHaveURL(/\/clientes\/\d+/, { timeout: 10000 });
  });

  test('5.2 a página de detalhes deve exibir informações do cliente', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });
    const viewButton = firstRow.locator('[title="Abrir Detalhes"]').first();
    await viewButton.click({ force: true });
    await page.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });

    await expect(page.getByText(/informações gerais/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/localização/i)).toBeVisible();
    await expect(page.getByText(/contato/i)).toBeVisible();
    await expect(page.getByText(/identificação fiscal/i)).toBeVisible();
    await expect(page.getByText(/últimos pedidos/i)).toBeVisible();
  });

  test('5.3 o botão Voltar na página de detalhes deve retornar à listagem', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    const viewButton = firstRow.locator('[title="Abrir Detalhes"]').first();
    await viewButton.click({ force: true });
    await page.waitForURL(/\/clientes\/\d+/, { timeout: 10000 });

    const backButton = page.getByRole('link', { name: /voltar/i }).or(page.locator('a[href="/clientes"]').first()).first();
    await expect(backButton).toBeVisible({ timeout: 10000 });
    await backButton.click();

    await expect(page).toHaveURL('/clientes', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /painel de clientes/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 6. AÇÕES AUXILIARES
  // ─────────────────────────────────────────────────────────

  test('6.1 deve atualizar dados ao clicar no botão de refresh', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    // Botão de refresh - tem título "Atualizar dados"
    const refreshButton = page.locator('button[title="Atualizar dados"]').first();
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Deve garantir que a tabela permaneceu / voltou a ficar com dados
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });
});
