import { test, expect } from '@playwright/test';

test.describe('Módulo Financeiro', () => {
  test('deve validar Contas a Pagar', async ({ page }) => {
    await page.goto('/financeiro/pagar');
    await expect(page.getByRole('heading', { name: /pagar/i }).first()).toBeVisible();
    
    const searchInput = page.getByPlaceholder(/localizar título ou fornecedor/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('deve validar Contas a Receber', async ({ page }) => {
    await page.goto('/financeiro/receber');
    await expect(page.getByRole('heading', { name: /receber/i }).first()).toBeVisible();
    
    const searchInput = page.getByPlaceholder(/localizar título ou cliente/i).first();
    await expect(searchInput).toBeVisible();
  });

  test('deve validar Contas Correntes (Bancos)', async ({ page }) => {
    await page.goto('/contas-correntes');
    await expect(page.getByRole('heading', { name: /contas|correntes|bancos/i })).toBeVisible();
    
    // Verifica se os cards de resumo aparecem
    await expect(page.getByText(/saldo|faturamento|pedidos/i).first()).toBeVisible();
    
    // Relaxa heading do Financeiro (H1/H2)
    await expect(page.getByRole('heading', { name: /contas correntes|fluxo de caixa/i }).first()).toBeVisible();
    
    // Se não houver dados, o teste de detalhes será ignorado ou passará se encontrar "vazio"
    const emptyState = page.getByText(/nenhuma conta|não há dados/i);
    if (await emptyState.isVisible()) {
      return;
    }

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Seletor robusto para o botão de detalhes (olho/external link ou título)
    const viewBtn = firstRow.locator('button').filter({ has: page.locator('svg.lucide-external-link, svg.lucide-eye, .lucide-external-link, .lucide-eye') }).first().or(firstRow.getByTitle(/detalhes|ver/i));
    await viewBtn.click();
    await expect(page).toHaveURL(/\/contas-correntes\/[\w-]+/);
  });
});
