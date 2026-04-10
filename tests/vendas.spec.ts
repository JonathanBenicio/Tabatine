import { test, expect } from '@playwright/test';

test.describe('Módulo de Vendas (Pedidos e NF)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendas');
    // Se redirecionou para login, a sessão do golden file (.auth/user.json) foi invalidada por outro teste ou expirou
    if (page.url().includes('/auth')) {
      throw new Error('Sessão inválida ou expirada. Verifique se algum teste de logout está invalidando a conta compartilhada.');
    }
  });

  test('deve alternar entre abas de Pedidos e Notas Fiscais', async ({ page }) => {
    // Verifica banner/título principal (H1)
    await expect(page.getByRole('heading', { name: /pedidos e faturamento/i }).first()).toBeVisible();

    // Aba padrão: Pedidos - H2 na VendasTable
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first()).toBeVisible({ timeout: 15000 });

    // Troca para Notas Fiscais
    await page.locator('button').filter({ hasText: /^Notas Fiscais$/ }).click();
    await expect(page.getByRole('heading', { name: /central de notas fiscais/i }).first()).toBeVisible({ timeout: 15000 });
    
    // Volta para Pedidos
    await page.getByRole('button', { name: /pedidos de venda/i }).click();
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('deve permitir busca por número do pedido ou cliente', async ({ page }) => {
    // 1. Aguarda carregamento inicial dos dados REAL na tabela (ignora skeletons)
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible({ timeout: 20000 });
    
    // 2. Localiza o input e garante que ele está pronto
    const searchInput = page.getByPlaceholder(/pesquisar pedido ou cliente/i);
    await expect(searchInput).toBeVisible();
    
    // 3. Usa fill em vez de type para evitar timeouts de ação desnecessários e ser mais rápido
    // Forçar o clique ajuda a focar o elemento se houver algum overlay transparente sutil
    await searchInput.click({ force: true });
    await searchInput.fill('001');
    
    // 4. Aguarda o sumiço do overlay "Calculando Matriz" se ele aparecer
    await expect(page.getByText(/Calculando Matriz/i)).not.toBeVisible({ timeout: 15000 });
    
    // 5. Verifica se os resultados atualizados estão visíveis
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
  });

  test('deve permitir ordenação por valor total', async ({ page }) => {
    // Aguarda carregar dados reais
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });
    
    const headerValor = page.getByRole('columnheader', { name: /valor total/i });
    // Força o clique no cabeçalho (z-index ou sticky headers podem atrapalhar no headless)
    await headerValor.click({ force: true });
    
    // Aguarda processamento
    await page.waitForTimeout(1000); 
    await expect(page.getByText(/Calculando Matriz/i)).not.toBeVisible({ timeout: 15000 });
    
    const firstRowAfterSort = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRowAfterSort).toBeVisible({ timeout: 10000 });
    
    // Testa abertura de detalhes
    const viewBtn = firstRowAfterSort.getByRole('button').filter({ has: page.locator('svg') }).first().or(firstRowAfterSort.getByTitle(/ver detalhes/i));
    await expect(viewBtn).toBeVisible();
    await viewBtn.click({ force: true });
    
    // Verifica se navegou para a página de detalhes
    await expect(page).toHaveURL(/\/vendas\/\d+/);
    
    // Volta e verifica se a tabela recarregou
    await page.goBack();
    await expect(page.getByRole('heading', { name: /análise de vendas/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('deve abrir o painel de filtros avançados', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });
    
    // Busca o botão de filtros ignorando se o texto está visível ou não para o motor de layout
    const filterBtn = page.locator('button').filter({ hasText: /filtros/i }).or(page.locator('button:has(.lucide-filter)'));
    await filterBtn.click({ force: true });
    
    await expect(page.getByText(/filtros avançados/i)).toBeVisible();
    await expect(page.getByText(/período customizado/i)).toBeVisible();
  });

  test('deve exportar para CSV', async ({ page }) => {
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 15000 });
    
    const exportButton = page.getByRole('button', { name: /exportar/i });
    await expect(exportButton).toBeVisible();
    
    // Configura o interceptador de download antes do clique
    const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
    await exportButton.click({ force: true });
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
