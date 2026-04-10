import { test, expect } from '@playwright/test';

test.describe('Equipe de Vendedores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendedores');
  });

  test('deve exibir a listagem de vendedores', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /equipe|vendedores/i })).toBeVisible();
    await expect(page.getByRole('table').or(page.getByText(/nenhum vendedor/i))).toBeVisible();
  });

  test('deve permitir buscar um vendedor', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/pesquisar vendedores/i);
    await searchInput.fill('Vendedor');
    await page.waitForTimeout(1000);
    
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('deve navegar para detalhes do vendedor', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    await firstRow.hover();
    const viewButton = firstRow.locator('button').filter({ has: page.locator('svg.lucide-eye, svg.lucide-user') }).first().or(firstRow.getByTitle(/detalhes|ver/i));
    await viewButton.click();

    await expect(page).toHaveURL(/\/vendedores\/[\w-]+/);
  });

  test('deve exibir cards de resumo (Total, Média Comissão)', async ({ page }) => {
    await expect(page.getByText(/vendedores|total/i).first()).toBeVisible();
    await expect(page.getByText(/comissão/i).first()).toBeVisible();
  });
});
