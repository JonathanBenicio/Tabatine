import { test, expect } from './fixtures/test';

test.describe('Navegação Principal', () => {
  // O Playwright usará automaticamente o storageState configurado no projeto chromium/firefox/webkit

  test('deve navegar para o Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('deve navegar para a lista de Pedidos', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Pedidos', exact: true }).click();
    await expect(page).toHaveURL(/\/vendas/);
    // Verifica se algum elemento da lista de vendas ou cabeçalho aparece
    await expect(page.getByRole('heading', { name: /pedidos|faturamento/i })).toBeVisible();
  });

  test('deve navegar para Notas Fiscais', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Notas Fiscais', exact: true }).click();
    await expect(page).toHaveURL(/\/nf/);
  });

  test('deve navegar para Clientes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Clientes', exact: true }).click();
    await expect(page).toHaveURL(/\/clientes/);
  });

  test('deve navegar para Produtos', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Produtos', exact: true }).click();
    await expect(page).toHaveURL(/\/produtos/);
  });

  test('deve navegar para Financeiro - Contas a Pagar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Contas a Pagar', exact: true }).click();
    await expect(page).toHaveURL(/\/financeiro\/pagar/);
  });

  test('deve navegar para Financeiro - Contas a Receber', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Contas a Receber', exact: true }).click();
    await expect(page).toHaveURL(/\/financeiro\/receber/);
  });

  test('deve acessar o Admin Webhooks DLQ', async ({ page }) => {
    await page.goto('/admin/webhooks');
    // Regex flexível para lidar com dash/em-dash/en-dash
    await expect(page.getByRole('heading', { name: /dead letter queue|webhooks/i }).first()).toBeVisible();
  });
});
