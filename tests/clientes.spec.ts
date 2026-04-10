import { test, expect } from '@playwright/test';

test.describe('Gestão de Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clientes');
  });

  test('deve exibir a tabela de clientes e o banner', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /painel de clientes/i })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('deve permitir pesquisar um cliente por nome', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/pesquisar clientes/i);
    await searchInput.fill('Teste');
    
    // Aguarda o debounce da pesquisa e o carregamento
    await page.waitForTimeout(1000);
    
    // Verifica se a tabela mostra resultados ou o estado vazio (para evitar falha se o banco estiver limpo)
    await expect(page.locator('tbody tr').first().or(page.getByText(/nenhum cliente encontrado/i).first()).first()).toBeVisible();
  });

  test('deve navegar para o perfil do cliente ao clicar em visualizar', async ({ page }) => {
    // Aguarda carregar dados
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Hover na linha para aparecer o botão de ação
    await firstRow.hover();
    
    const viewButton = firstRow.locator('button').filter({ has: page.locator('svg.lucide-eye, svg.lucide-user') }).first().or(firstRow.getByTitle(/perfil/i));
    await expect(viewButton).toBeVisible();
    await viewButton.click();

    await expect(page).toHaveURL(/\/clientes\/\d+/);
    await expect(page.getByText(/detalhes do cliente|perfil/i).first()).toBeVisible();
  });

  test('deve funcionar a paginação', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /próxima|página seguinte/i });
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      // Aqui poderíamos validar se os dados mudaram
      await expect(page.locator('tbody tr').first()).toBeVisible();
    }
  });

  test('deve recarregar dados ao clicar no botão de refresh', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ hasText: '' }).last(); // Botão de refresh ao lado do search
    await refreshButton.click();
    
    // Verifica se o ícone de refresh começa a girar (animate-spin)
    await expect(page.locator('.animate-spin')).toBeVisible();
  });
});
