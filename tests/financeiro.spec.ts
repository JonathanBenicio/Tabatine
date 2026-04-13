import { test, expect } from './fixtures/test';

test.describe('Módulo Financeiro - Pagar e Receber', () => {

  test.describe('Contas a Pagar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/financeiro/pagar');
    });

    test('CT-01: Deve renderizar a tabela de Contas a Pagar corretamente', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Contas a Pagar', exact: true }).first()).toBeVisible();
      
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
      if (await emptyState.isVisible()) {
        return; // Early return se não houver dados
      }

      await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
      await expect(page.getByText(/Total a Pagar/i)).toBeVisible();
    });

    test('CT-02: Deve permitir realizar busca de títulos a pagar', async ({ page }) => {
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
      if (await emptyState.isVisible()) {
        return;
      }

      await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
      
      const searchInput = page.getByPlaceholder(/Localizar fornecedor/i);
      await searchInput.fill('xyzasdfnonexistent');
      await page.waitForTimeout(1500); // Debounce
      
      // Valida o empty state após busca
      await expect(page.getByText(/nenhum título financeiro encontrado/i).first()).toBeVisible();

      // Limpa busca
      await searchInput.clear();
      await page.waitForTimeout(1500);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
    });

    test('CT-03: Deve permitir navegação por paginação em pagar', async ({ page }) => {
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
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
  });

  test.describe('Contas a Receber', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/financeiro/receber');
    });

    test('CT-01: Deve renderizar a tabela de Contas a Receber corretamente', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Contas a Receber', exact: true }).first()).toBeVisible();
      
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
      if (await emptyState.isVisible()) {
        return;
      }

      await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
      await expect(page.getByText(/Total a Receber/i)).toBeVisible();
    });

    test('CT-02: Deve permitir realizar busca de títulos a receber', async ({ page }) => {
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
      if (await emptyState.isVisible()) {
        return;
      }

      await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 15000 });
      
      const searchInput = page.getByPlaceholder(/Localizar cliente/i);
      await searchInput.fill('xyzasdfnonexistent');
      await page.waitForTimeout(1500);
      
      await expect(page.getByText(/nenhum título financeiro encontrado/i).first()).toBeVisible();
      
      await searchInput.clear();
      await page.waitForTimeout(1500);
      await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
    });

    test('CT-03: Deve permitir navegação por paginação em receber', async ({ page }) => {
      const emptyState = page.getByText(/nenhum título financeiro encontrado/i);
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
  });

});
