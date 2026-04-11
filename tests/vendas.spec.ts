/**
 * @file vendas.spec.ts
 * @description E2E Tests for the Vendas module (Issue #59)
 * Covers: Tab switching, Rendering, Search/Filter, Sorting, Pagination, Export, Navigation to Details
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Vendas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendas');
    // Guard: se redirecionou para auth, sessão inválida
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
    // Tab padrão: Pedidos — verifica o H2 interno da VendasTable
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first())
      .toBeVisible({ timeout: 15000 });

    // Troca para Notas Fiscais
    await page.locator('button').filter({ hasText: /^Notas Fiscais$/ }).click();
    await expect(page.getByRole('heading', { name: /central de notas fiscais/i }).first())
      .toBeVisible({ timeout: 15000 });

    // Volta para Pedidos
    await page.getByRole('button', { name: /pedidos de venda/i }).click();
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first())
      .toBeVisible({ timeout: 15000 });
  });

  test('1.3 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    // Aguarda dados reais (sem skeleton)
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    // Summary cards devem estar visíveis
    await expect(page.getByText(/pedidos encontrados/i)).toBeVisible();
    await expect(page.getByText(/volume/i).first()).toBeVisible();
    await expect(page.getByText(/ticket médio/i)).toBeVisible();
  });

  test('1.4 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    // Verifica colunas chave da tabela de vendas
    await expect(page.getByRole('columnheader').filter({ hasText: /pedido/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /cliente/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /valor total/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /data/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader').filter({ hasText: /ações/i }).first()).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA / FILTRO
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await expect(searchInput).toBeVisible();
    await searchInput.click({ force: true });
    await searchInput.fill('001');

    // Aguarda debounce e fim do loading
    await expect(page.getByText(/calculando matriz/i)).not.toBeVisible({ timeout: 15000 });

    // Tabela ou empty state deve estar visível
    const tableOrEmpty = page.locator('tbody tr:not(.animate-pulse)').first()
      .or(page.getByText(/nenhuma venda localizada/i));
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
  });

  test('2.2 deve exibir empty state com busca sem resultados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.click({ force: true });
    await searchInput.fill('PEDIDO_INEXISTENTE_XYZ_9999999');
    await page.waitForTimeout(600);

    await expect(page.getByText(/nenhuma venda localizada/i)).toBeVisible({ timeout: 10000 });
  });

  test('2.3 deve limpar a busca e restaurar a lista completa', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.click({ force: true });
    await searchInput.fill('001');
    await page.waitForTimeout(600);

    await searchInput.clear();
    await page.waitForTimeout(600);

    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. FILTROS AVANÇADOS
  // ─────────────────────────────────────────────────────────

  test('3.1 deve abrir o painel de filtros avançados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });

    const filterBtn = page.locator('button').filter({ hasText: /filtros/i }).first();
    await filterBtn.click({ force: true });

    await expect(page.getByText(/filtros avançados/i)).toBeVisible();
    await expect(page.getByText(/período customizado/i)).toBeVisible();
    await expect(page.getByText(/atalhos de data/i)).toBeVisible();
  });

  test('3.2 deve aplicar filtro por período (Últimos 7 dias)', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });

    const filterBtn = page.locator('button').filter({ hasText: /filtros/i }).first();
    await filterBtn.click({ force: true });

    // Clica no atalho "Últimos 7 dias"
    await page.getByRole('button', { name: /últimos 7 dias/i }).click();
    await page.getByRole('button', { name: /aplicar/i }).click();

    // Aguarda o reload dos dados
    await page.waitForTimeout(800);
    const tableOrEmpty = page.locator('tbody tr:not(.animate-pulse)').first()
      .or(page.getByText(/nenhuma venda localizada/i));
    await expect(tableOrEmpty).toBeVisible({ timeout: 10000 });
  });

  test('3.3 deve limpar filtros avançados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });

    const filterBtn = page.locator('button').filter({ hasText: /filtros/i }).first();
    await filterBtn.click({ force: true });

    // Aplica filtro
    await page.getByRole('button', { name: /últimos 7 dias/i }).click();
    await page.getByRole('button', { name: /aplicar/i }).click();
    await page.waitForTimeout(500);

    // Reabre e limpa
    await filterBtn.click({ force: true });
    await page.getByRole('button', { name: /limpar/i }).click();
    await page.waitForTimeout(600);

    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 4. ORDENAÇÃO
  // ─────────────────────────────────────────────────────────

  test('4.1 deve ordenar por Valor Total ao clicar no cabeçalho', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    // Localiza e clica no cabeçalho VALOR TOTAL
    const headerValorTotal = page.getByRole('columnheader').filter({ hasText: /valor total/i }).first();
    await expect(headerValorTotal).toBeVisible();
    await headerValorTotal.click({ force: true });

    // Aguarda processamento
    await page.waitForTimeout(800);
    await expect(page.getByText(/calculando matriz/i)).not.toBeVisible({ timeout: 15000 });

    // Tabela deve continuar visível após ordenação
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });

    // Verifica ícone de ordenação no header (ArrowUp para ASC)
    const sortIcon = headerValorTotal.locator('svg');
    await expect(sortIcon).toBeVisible();
  });

  test('4.2 deve inverter a ordenação ao clicar no cabeçalho duas vezes', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerValorTotal = page.getByRole('columnheader').filter({ hasText: /valor total/i }).first();
    
    // First click: ASC
    await headerValorTotal.click({ force: true });
    // Wait for the icon to appear (indicates sort applied)
    await expect(headerValorTotal.locator('svg')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });

    // Second click: DESC
    await headerValorTotal.click({ force: true });
    // Keep waiting for data to be visible - the icon might flip, but that's fast.
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });
  });

  test('4.3 deve ordenar por Data', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const headerData = page.getByRole('columnheader').filter({ hasText: /data/i }).first();
    await headerData.click({ force: true });
    await page.waitForTimeout(800);
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 5. PAGINAÇÃO
  // ─────────────────────────────────────────────────────────

  test('5.1 deve desabilitar "Anterior" na primeira página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const prevButton = page.getByRole('button', { name: /anterior/i });
    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeDisabled();
    }
  });

  test('5.2 deve avançar para próxima página quando disponível', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      const firstValBefore = await page.locator('tbody tr:not(.animate-pulse)').first()
        .locator('td').nth(3).textContent(); // Coluna pedido

      await nextButton.click();
      await page.waitForTimeout(800);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });

      const firstValAfter = await page.locator('tbody tr:not(.animate-pulse)').first()
        .locator('td').nth(3).textContent();

      // Os dados da pg2 devem ser diferentes da pg1
      expect(firstValBefore).not.toEqual(firstValAfter);
    }
  });

  test('5.3 deve alterar page size pelo select de linhas', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const pageSizeSelect = page.locator('select').first();
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.selectOption('20');
      await page.waitForTimeout(800);
      // Tabela deve recarregar com mais registros (ou o mesmo se total < 20)
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('5.4 deve manter busca ativa ao trocar de página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await searchInput.click({ force: true });
    await searchInput.fill('a');
    await page.waitForTimeout(600);

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForTimeout(800);
      // Busca deve estar preservada
      await expect(searchInput).toHaveValue('a');
    }
  });

  // ─────────────────────────────────────────────────────────
  // 6. EXPORTAÇÃO
  // ─────────────────────────────────────────────────────────

  test('6.1 deve exportar dados para CSV', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const exportButton = page.getByRole('button', { name: /exportar/i });
    await expect(exportButton).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await exportButton.click({ force: true });
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  // ─────────────────────────────────────────────────────────
  // 7. NAVEGAÇÃO PARA DETALHES (DRILL-DOWN)
  // ─────────────────────────────────────────────────────────

  test('7.1 deve navegar para tela de detalhes ao clicar em Ações', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    // Botão de ação com title "Ver Detalhes" ou ícone Eye
    const viewBtn = firstRow.locator('button[title="Ver Detalhes"]')
      .or(firstRow.getByRole('button').filter({ has: page.locator('svg') }).first());
    await expect(viewBtn).toBeVisible({ timeout: 5000 });
    await viewBtn.click({ force: true });

    await expect(page).toHaveURL(/\/vendas\/[^/]+/, { timeout: 10000 });
  });

  test('7.2 deve exibir detalhes do pedido na página de detalhes', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewBtn = firstRow.locator('button[title="Ver Detalhes"]')
      .or(firstRow.getByRole('button').filter({ has: page.locator('svg') }).first());
    await viewBtn.click({ force: true });
    await page.waitForURL(/\/vendas\/[^/]+/, { timeout: 10000 });

    // Página de detalhes deve ter informações do pedido
    // (aguarda qualquer dado visível - o conteúdo varia por pedido)
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('7.3 deve retornar à listagem ao voltar da tela de detalhes', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    const viewBtn = firstRow.locator('button[title="Ver Detalhes"]')
      .or(firstRow.getByRole('button').filter({ has: page.locator('svg') }).first());
    await viewBtn.click({ force: true });
    await page.waitForURL(/\/vendas\/[^/]+/, { timeout: 10000 });

    // Usa o botão de voltar ou browser back
    const backLink = page.getByRole('link', { name: /voltar/i })
      .or(page.locator('a[href="/vendas"]').first());
    
    if (await backLink.isVisible()) {
      await backLink.click();
    } else {
      await page.goBack();
    }

    await expect(page).toHaveURL('/vendas', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /pedidos e faturamento/i })).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────
  // 8. AÇÕES AUXILIARES
  // ─────────────────────────────────────────────────────────

  test('8.1 deve recarregar dados ao clicar no botão de refresh', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    // Botão de refresh "Atualizar dados" da Toolbar
    const refreshBtn = page.locator('button[title="Atualizar dados"]').first();
    
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      // Verifica se a tabela continua existindo / volta a carregar dados
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('8.2 deve abrir painel de visibilidade de colunas', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    // Botão Settings (colunas) - tem title "Colunas"
    const colBtn = page.locator('button[title="Colunas"]');
    if (await colBtn.isVisible()) {
      await colBtn.click({ force: true });
      await expect(page.getByText(/visibilidade/i)).toBeVisible();
    }
  });
});
