/**
 * @file configuracoes-apoio.spec.ts
 * @description E2E Tests for Supporting modules (Bancos, Condições, etc.)
 * Hardened to follow the Universal Roadmap.
 */
import { test, expect } from './fixtures/test';

test.describe('Módulo: Configurações de Apoio', () => {

  const modulosApoio = [
    { url: '/bancos', apiPath: '/api/supabase/bancos', label: 'Bancos', matchName: /bancos/i },
    { url: '/condicoes-pagamento', apiPath: '/api/supabase/condicoes', label: 'Condições de Pagamento', matchName: /condições de pagamento/i },
    { url: '/etapas-faturamento', apiPath: '/api/supabase/etapas', label: 'Etapas de Faturamento', matchName: /etapas de faturamentos?|etapas/i },
    { url: '/formas-pagamento', apiPath: '/api/supabase/formas', label: 'Formas de Pagamento', matchName: /formas de pagamento/i },
    { url: '/meios-pagamento', apiPath: '/api/supabase/meios', label: 'Meios de Pagamento', matchName: /meios de pagamento/i },
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
        const searchInput = page.locator('input[placeholder*="Pesquisar"], input[placeholder*="Localizar"]').first();
        if (!(await searchInput.isVisible())) return;

        await searchInput.fill('TERMO_INEXISTENTE_XYZ');
        await page.waitForTimeout(800);
        await expect(page.getByText(/nenhum|nenhuma|encontrado/i).first()).toBeVisible({ timeout: 10000 });

        await searchInput.clear();
        await page.waitForTimeout(800);
        // Deve restaurar algum dado (se existir)
      });

      // 3. ORDENAÇÃO (Mapeia a 2ª coluna geralmente descritiva)
      test(`3.1 deve permitir ordenação (Sorting Pillar)`, async ({ page }) => {
        const firstHeader = page.locator('th').filter({ has: page.locator('button') }).first();
        if (await firstHeader.isVisible()) {
          await firstHeader.click({ force: true });
          await page.waitForTimeout(800);
          await expect(firstHeader.locator('svg')).toBeVisible({ timeout: 10000 });
        }
      });

      // 4. PAGINAÇÃO
      test(`4.1 deve permitir paginação se disponível (Pagination Pillar)`, async ({ page }) => {
        const nextButton = page.getByRole('button', { name: /próxima/i });
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible({ timeout: 10000 });
        }
      });

      // 5. DRILL-DOWN
      test(`5.1 deve navegar para detalhes e permitir voltar (Drill-down Pillar)`, async ({ page }) => {
        const rows = page.locator('tbody tr:not(.animate-pulse)');
        if (await rows.count() === 0) return;

        const firstRow = rows.first();
        const viewLink = firstRow.locator('a[title*="Detalhes"], button[title*="Detalhes"]').first();
        
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
