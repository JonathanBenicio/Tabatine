/**
 * @file configuracoes-apoio.spec.ts
 * @description E2E Tests for Supporting modules (Bancos, Condições, etc.)
 * Hardened to follow the Universal Roadmap.
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Configurações de Apoio', () => {

  const modulosApoio = [
    { url: '/bancos', apiPath: '/api/supabase/bancos', label: 'Bancos', matchName: /bancos/i },
    { url: '/condicoes-pagamento', apiPath: '/api/supabase/condicoes-pagamento', label: 'Condições de Pagamento', matchName: /condições de pagamento/i },
    { url: '/etapas-faturamento', apiPath: '/api/supabase/etapas-faturamento', label: 'Etapas de Faturamento', matchName: /etapas de faturamentos?|etapas/i },
    { url: '/formas-pagamento', apiPath: '/api/supabase/formas-pagamento', label: 'Formas de Pagamento', matchName: /formas de pagamento/i },
    { url: '/meios-pagamento', apiPath: '/api/supabase/meios-pagamento', label: 'Meios de Pagamento', matchName: /meios de pagamento/i },
  ];

  for (const modulo of modulosApoio) {
    test.describe(`Apoio: ${modulo.label}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(modulo.url);
        await page.waitForLoadState('networkidle');
      });

      // 1. RENDERIZAÇÃO
      test(`1.1 deve renderizar título e tabela de ${modulo.label}`, async ({ page }) => {
        await expect(page.getByRole('heading', { name: modulo.matchName }).first()).toBeVisible({ timeout: 15000 });
        
        const rows = page.locator('tbody tr:not(.animate-pulse)');
        const emptyState = page.getByText(/nenhum|nenhuma/i).first();
        await expect(rows.first().or(emptyState)).toBeVisible({ timeout: 20000 });
      });

      // 2. BUSCA
      test(`2.1 deve permitir busca e limpar (Search Pillar)`, async ({ page }) => {
        const searchInput = page.getByTestId('table-search-input').first();
        if (!(await searchInput.isVisible())) return;

        // Limpa estado anterior e digita termo inexistente
        await searchInput.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('INEXISTENTE_XYZ_123', { delay: 30 });
        await page.keyboard.press('Enter');

        // Aguarda processamento e rede
        await page.waitForTimeout(2000);

        // Verifica se a mensagem de vazio apareceu
        const emptyMsg = page.locator('p, div').filter({ hasText: /nenhum|nenhuma|encontrado/i }).first();
        await expect(emptyMsg).toBeVisible({ timeout: 10000 });

        // Limpa e volta ao normal
        await searchInput.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        
        const rows = page.locator('tbody tr:not(.animate-pulse)');
        const emptyState = page.getByText(/nenhum|nenhuma/i).first();
        await expect(rows.first().or(emptyState)).toBeVisible({ timeout: 10000 });
      });

      // 3. PAGINAÇÃO E NAVEGAÇÃO
      test(`3.1 deve permitir paginação se disponível (Pagination Pillar)`, async ({ page }) => {
        const nextButton = page.getByRole('button', { name: /próxima/i });
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
        }
      });

      // 4. ORDENAÇÃO
      test(`4.1 deve permitir ordenação (Sorting Pillar)`, async ({ page }) => {
        const firstHeader = page.locator('th').filter({ has: page.locator('button') }).first();
        if (await firstHeader.isVisible()) {
          await firstHeader.click({ force: true });
          await page.waitForTimeout(800);
          await expect(firstHeader.locator('svg')).toBeVisible({ timeout: 10000 });
        }
      });

      // 5. DRILL-DOWN E DETALHES
      test(`5.1 deve navegar para detalhes e permitir voltar (Drill-down Pillar)`, async ({ page }) => {
        const rows = page.locator('tbody tr:not(.animate-pulse)');
        if (await rows.count() === 0) return;

        const firstRow = rows.first();
        const viewLink = firstRow.locator('[title="Abrir Detalhes"]').first();
        
        if (await viewLink.isVisible()) {
          await viewLink.click({ force: true });
          await page.waitForTimeout(1000);
          
          if (page.url().includes(modulo.url) && page.url() !== `${process.env.PLAYWRIGHT_TEST_BASE_URL}${modulo.url}`) {
             // Estamos em um sub-path
             const backBtn = page.getByRole('link', { name: /voltar/i }).or(page.locator('button:has-text("Voltar")')).first();
             if (await backBtn.isVisible()) {
               await backBtn.click();
               await expect(page).toHaveURL(modulo.url, { timeout: 10000 });
             }
          }
        }
      });
    });
  }
});
