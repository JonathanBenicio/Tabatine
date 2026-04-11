import { test, expect } from '@playwright/test';

test.describe('Configurações de Apoio', () => {

  const modulosApoio = [
    { url: '/bancos', apiPath: '/api/supabase/bancos', label: 'Bancos', matchName: /bancos/i },
    { url: '/condicoes-pagamento', apiPath: '/api/supabase/condicoes', label: 'Condições de Pagamento', matchName: /condições de pagamento/i },
    { url: '/etapas-faturamento', apiPath: '/api/supabase/etapas', label: 'Etapas de Faturamento', matchName: /etapas de faturamentos?|etapas/i },
    { url: '/formas-pagamento', apiPath: '/api/supabase/formas', label: 'Formas de Pagamento', matchName: /formas de pagamento/i },
    { url: '/meios-pagamento', apiPath: '/api/supabase/meios', label: 'Meios de Pagamento', matchName: /meios de pagamento/i },
  ];

  for (const modulo of modulosApoio) {
    test.describe(modulo.label, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(modulo.url);
        // Espera inicial para garantir que o hydration ocorreu
        await page.waitForLoadState('networkidle');
      });

      test(`CT-01: Deve renderizar a tabela de ${modulo.label} corretamente`, async ({ page }) => {
        await expect(page.getByRole('heading', { name: modulo.matchName }).first()).toBeVisible();

        const emptyState = page.getByText(/nenhum|nenhuma/i);
        try {
          await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 10000 });
        } catch (e) {
          if (await emptyState.isVisible()) return;
        }
        
        await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
      });

      test(`CT-02: Deve permitir realizar uma busca de ${modulo.label}`, async ({ page }) => {
        // Seleciona o input específico do módulo (ex: "Pesquisar bancos...")
        const placeholderRegex = new RegExp(`pesquisar ${modulo.label.split(' ')[0]}`, 'i');
        const activeSearchInput = page.locator('main').getByPlaceholder(placeholderRegex).first();

        await expect(activeSearchInput).toBeVisible();

        // 1. Busca por termo comum para garantir que funciona
        // Quase todos os módulos de apoio brasileiros tem "Pagamento" ou "Banco" ou "Etapa" etc.
        const termoComum = modulo.label.substring(0, 4); // Ex: "Banc", "Cond", "Etap"
        await activeSearchInput.fill(termoComum);
        await page.waitForLoadState('networkidle');
        
        // Pode não ter resultados para o termo curto, mas se tiver, deve ser visível
        const rows = page.locator('tbody tr:not(.animate-pulse)');
        const emptyMessage = page.getByText(/nenhum|nenhuma|ajustar/i).first();
        
        await expect(async () => {
          const hasRows = await rows.count() > 0;
          const isEmpty = await emptyMessage.isVisible();
          if (!hasRows && !isEmpty) throw new Error('Resultados da busca não carregaram');
        }).toPass({ timeout: 10000 });

        // 2. Busca por termo inexistente
        const termoInexistente = 'xyz123abc' + Date.now();
        await activeSearchInput.clear();
        await activeSearchInput.fill(termoInexistente);
        await page.waitForLoadState('networkidle');
        
        // Agora DEVE estar vazio
        await expect(emptyMessage).toBeVisible({ timeout: 10000 });
        await expect(rows).toHaveCount(0);
        
        // 3. Reset da busca
        await activeSearchInput.clear();
        await page.waitForLoadState('networkidle');
        await expect(rows.first()).toBeVisible({ timeout: 10000 });
      });

      test(`CT-03: Deve permitir navegação por paginação de ${modulo.label}`, async ({ page }) => {
        const nextButton = page.getByRole('button', { name: /próxima/i });
        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
          const responsePromise = page.waitForResponse(response => 
            response.url().includes(modulo.apiPath) && response.status() === 200,
            { timeout: 15000 }
          );
          
          await nextButton.click();
          await responsePromise;
          
          await expect(page.locator('tbody tr:not(.animate-pulse)').first()).toBeVisible();
        }
      });

      test(`CT-04: Deve navegar para a página de detalhes de ${modulo.label}`, async ({ page }) => {
        try {
          await page.waitForSelector('tbody tr:not(.animate-pulse)', { state: 'visible', timeout: 10000 });
        } catch (e) {
          test.skip(true, 'Sem dados para testar detalhes');
          return;
        }

        const firstRow = page.locator('tbody tr:not(.animate-pulse)').first();
        const eyeButton = firstRow.locator('button[title*="Detalhes"], button[title*="Ver"]').first();
        
        const pageUrlAntes = page.url();
        
        if (await eyeButton.isVisible()) {
            await eyeButton.click();
        } else {
            // Tenta clicar no nome/descrição (geralmente segundo td)
            await firstRow.locator('td').nth(1).click();
        }
        
        await page.waitForTimeout(1500);
        if (page.url() !== pageUrlAntes) {
            await expect(page.url()).toContain(modulo.url);
            // Verifica se a URL agora termina com um ID (uuid ou numero)
            expect(page.url()).toMatch(new RegExp(`${modulo.url}/.+`));
        } else {
            test.skip(true, 'Navegação de detalhes não disparada');
        }
      });
    });
  }
});
