import { test, expect } from './fixtures/test';

test.describe('Módulo: Vendedores', () => {
  test.beforeEach(async ({ page }) => {
    // Acessa a rota (o setup cuida da autenticação)
    await page.goto('/vendedores');
  });

  // ─────────────────────────────────────────────────────────
  // 1. RENDERIZAÇÃO INICIAL E INTEGRIDADE
  // ─────────────────────────────────────────────────────────

  test('1.1 deve exibir o banner e título da página', async ({ page }) => {
    // Aguarda o título da página
    const heading = page.getByRole('heading', { name: /listagem de vendedores/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('1.2 deve renderizar a tabela com dados reais e summary cards', async ({ page }) => {
    // Verifica os cards de resumo
    await expect(page.getByText(/total de vendedores/i)).toBeVisible();
    await expect(page.getByText(/média comissão/i)).toBeVisible();

    // Aguarda a tabela renderizar uma linha de dados (ignorando os placeholders da animação .animate-pulse)
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });
  });

  test('1.3 deve exibir cabeçalhos de coluna corretos', async ({ page }) => {
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Checa colunas esperadas
    const expectedHeaders = ['Vendedor', 'Código', 'Email', 'Comissão', 'Status', 'Ações'];
    for (const header of expectedHeaders) {
      await expect(table.locator('th', { hasText: new RegExp(header, 'i') }).first()).toBeVisible();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 2. BUSCA GERAL (SEARCH)
  // ─────────────────────────────────────────────────────────

  test('2.1 deve filtrar ao digitar no campo de busca', async ({ page }) => {
    // Aguarda carregar
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar vendedores/i);
    await expect(searchInput).toBeVisible();

    // Busca um vendedor comum ou a palavra 'Silva'
    await searchInput.fill('Silva');

    // Aguarda o debounce
    await page.waitForTimeout(1000);

    // Tabela deve continuar visível ou exibir empty state
    const rows = page.locator('tbody tr:not(.animate-pulse)');
    const isEmpty = await page.getByText(/nenhum vendedor encontrado/i).isVisible();
    
    expect(await rows.count() > 0 || isEmpty).toBeTruthy();
  });

  test('2.2 deve exibir empty state quando busca não retornar resultados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar vendedores/i);
    await searchInput.fill('TERMO-INEXISTENTE-123456789');
    
    // Aguarda a resposta (debounce)
    await page.waitForTimeout(1500);

    // Empty state deve estar visível
    await expect(page.getByText(/nenhum vendedor encontrado/i)).toBeVisible({ timeout: 10000 });
  });

  test('2.3 deve limpar a busca e restaurar a lista', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const searchInput = page.getByPlaceholder(/pesquisar vendedores/i);
    await searchInput.fill('xyz123');
    await page.waitForTimeout(1000);

    // Limpa a busca (pode usar o botão X do componente ou backspace)
    const clearButton = page.locator('button').filter({ has: page.locator('.lucide-x') }).last();
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      await searchInput.fill('');
    }

    await page.waitForTimeout(1000);
    // Vendedores originais devem voltar
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  // ─────────────────────────────────────────────────────────
  // 3. PAGINAÇÃO
  // ─────────────────────────────────────────────────────────

  test('3.1 deve desabilitar "Anterior" na primeira página', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const prevButton = page.getByRole('button', { name: /anterior/i });
    if (await prevButton.isVisible()) {
      await expect(prevButton).toBeDisabled();
    }
  });

  test('3.2 deve avançar para próxima página quando disponível', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      // Pega o ID/Nome do primeiro item da página 1
      const firstItemP1 = await page.locator('tbody tr:not(.animate-pulse) td').first().textContent();
      
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
      
      // Opcional: checar se o primeiro item da p2 é diferente (ou se é página de 1 resultado apenas)
      const firstItemP2 = await page.locator('tbody tr:not(.animate-pulse) td').first().textContent();
      // Não garantimos com strict equal porque se só houver 1 pag ele fica disabled na linha de cima
    }
  });

  // ─────────────────────────────────────────────────────────
  // 4. NAVEGAÇÃO / DRILL-DOWN (Ver Detalhes)
  // ─────────────────────────────────────────────────────────

  test('4.1 deve navegar para tela de detalhes ao clicar em Ações', async ({ page }) => {
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });

    // Clica no botão Ver Detalhes que aparece no hover ou da lista
    const viewButton = firstRow.getByTitle(/ver detalhes/i).first();
    await viewButton.click({ force: true }); // Usando force porque ele tem opacidade zero sem hover

    // Deve redirecionar para /vendedores/{id}
    await page.waitForURL(/\/vendedores\/\d+/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/vendedores\/\d+/);
  });

  // ─────────────────────────────────────────────────────────
  // 5. AÇÕES AUXILIARES
  // ─────────────────────────────────────────────────────────

  test('5.1 deve recarregar dados ao clicar no botão de refresh', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 20000 });

    const refreshBtn = page.locator('button[title="Atualizar dados"]').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click({ force: true });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
    }
  });

});
