import { test, expect } from './fixtures/test';

test.describe('Dashboard de Desempenho', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para o dashboard antes de cada teste
    await page.goto('/dashboard');
  });

  test('deve renderizar o banner e o título principal', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard de desempenho/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/acompanhe o faturamento|resumo/i).first()).toBeVisible();
  });

  test('deve exibir os seletores de semana e ano', async ({ page }) => {
    await expect(page.getByText(/semana/i).first()).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible(); // Seletor de semana
    await expect(page.getByText(/ano/i)).toBeVisible();
  });

  test('deve exibir os cards de métricas (Faturamento, Pedidos, etc)', async ({ page }) => {
    // Aguarda carregar
    await expect(page.getByText(/carregando/i)).not.toBeVisible({ timeout: 20000 });

    // Verifica headings de métricas
    await expect(page.getByRole('heading', { name: "Faturamento" }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: "Pedidos" }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: "Ticket Médio" }).first()).toBeVisible();
    await expect(page.getByText('Melhor Dia').first()).toBeVisible();
    await expect(page.getByText('Comissão').first()).toBeVisible();
  });

  test('deve renderizar os containers de gráficos', async ({ page }) => {
    // Aguarda carregar (desaparecer o spinner)
    await expect(page.getByText(/carregando/i)).not.toBeVisible({ timeout: 15000 });
    
    // Os containers responsivos devem estar lá, mesmo sem dados os títulos dos gráficos aparecem
    await expect(page.getByText(/faturamento por dia/i)).toBeVisible();
    await expect(page.getByText(/pedidos por status/i)).toBeVisible();
    
    // Verifica se há pelo menos um container de gráfico visível
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
  });

  test('deve exibir os rankings de vendedores e produtos', async ({ page }) => {
    await expect(page.getByText(/top vendedores/i)).toBeVisible();
    await expect(page.getByText(/top produtos/i)).toBeVisible();
  });

  test('deve permitir trocar de semana via botões de navegação', async ({ page }) => {
    // Localiza o label da semana pelo ID que adicionamos
    const weekLabel = page.locator('#week-label');
    await expect(weekLabel).toBeVisible();
    
    // Usa seletor baseado no ícone chevron (ChevronLeft/ChevronRight) que é mais estável
    const prevBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left, .lucide-chevron-left') }).last();
    const nextBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right, .lucide-chevron-right') }).last();
    
    await prevBtn.click();
    await page.waitForTimeout(500);
    await expect(weekLabel).toBeVisible();

    await nextBtn.click();
    await page.waitForTimeout(500);
    await expect(weekLabel).toBeVisible();
  });
});
