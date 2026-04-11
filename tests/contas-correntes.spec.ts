import { test, expect } from '@playwright/test';

test.describe('Módulo Contas Correntes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contas-correntes');
  });

  test('CT-01: Deve renderizar a tabela de Contas Correntes corretamente', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Contas Correntes', exact: true }).first()).toBeVisible();
    
    // Verifica se os cards de resumo aparecem
    await expect(page.getByText(/Total de Contas/i).first()).toBeVisible();
    await expect(page.getByText(/Saldo Inicial/i).first()).toBeVisible();

    const emptyState = page.getByText(/Nenhuma conta encontrada/i);
    if (await emptyState.isVisible()) {
      return; // Early return se não houver dados
    }

    await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
  });

  test('CT-02: Deve permitir realizar uma busca de contas correntes', async ({ page }) => {
    const emptyState = page.getByText(/Nenhuma conta encontrada/i);
    if (await emptyState.isVisible()) {
      return;
    }

    await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
    
    // O placeholder no TableSearch
    const searchInput = page.getByPlaceholder(/Pesquisar contas.../i);
    await searchInput.fill('xyzasdfnonexistent'); // string que provavelmente não retorna nada
    await page.waitForTimeout(1500); // Debounce e loading do backend
    
    await expect(page.getByText(/Nenhuma conta/i).first()).toBeVisible();
    
    await searchInput.clear();
    await page.waitForTimeout(1500);
    await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
  });

  test('CT-03: Deve permitir navegação por paginação', async ({ page }) => {
    const emptyState = page.getByText(/Nenhuma conta encontrada/i);
    if (await emptyState.isVisible()) {
      return;
    }

    await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
    
    const nextButton = page.getByRole('button', { name: /próxima/i });
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
    }
  });

  test('CT-04: Deve navegar para a página de detalhes da conta', async ({ page }) => {
    const emptyState = page.getByText(/Nenhuma conta encontrada/i);
    if (await emptyState.isVisible()) {
      return;
    }

    await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
    const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
    await expect(firstRow).toBeVisible();

    // Clica no botão de detalhes (olho)
    const btnDetalhes = firstRow.getByTitle(/Ver Detalhes/i);
    if (await btnDetalhes.isVisible()) {
         await btnDetalhes.click();
         await expect(page).toHaveURL(/\/contas-correntes\/\d+/);
    } else {
        // Se o botão não estiver visível (opacity-0 hover required), podemos clicar na célula
        await firstRow.click();
        await expect(page).toHaveURL(/\/contas-correntes\/\d+/);
    }
  });
});
