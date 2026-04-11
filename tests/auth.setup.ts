import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
  const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    if (process.env.CI) {
      throw new Error(
        '\n❌ ERRO DE CONFIGURAÇÃO: As variáveis PLAYWRIGHT_TEST_EMAIL ou PLAYWRIGHT_TEST_PASSWORD não foram encontradas no ambiente de CI.\n' +
        'Configure os GitHub Secrets para que os testes E2E possam realizar a autenticação.\n'
      );
    }
    
    console.warn('PLAYWRIGHT_TEST_EMAIL ou PLAYWRIGHT_TEST_PASSWORD não definidos. Criando estado de autenticação vazio para evitar erro ENOENT.');
    // Salva um estado vazio para evitar que o Playwright quebre ao tentar ler o arquivo no boot de outros projetos
    await page.context().storageState({ path: authFile });
    return;
  }

  await page.goto('/auth/login');
  await page.getByLabel(/e-mail|email/i).fill(TEST_EMAIL);
  await page.getByLabel(/senha|password/i).fill(TEST_PASSWORD);
  // Clica no botão "Entrar"
  await page.getByRole('button', { name: /entrar|login/i }).click();

  // Aguarda chegar no dashboard e espera a rede ficar ociosa para garantir que cookies foram persistidos
  await expect(page).toHaveURL(/\/(dashboard)?/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');

  // Verifica um elemento visual que só aparece logado (ex: o nome/perfil no LayoutWrapper)
  await expect(page.getByText(/Administrador/i).first()).toBeVisible({ timeout: 15000 });
  
  // Verifica se o cookie de sessão está presente
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name.includes('auth-token'));
  if (!authCookie) {
    console.error('ALERTA: Cookie de autenticação não encontrado após login bem-sucedido.');
  }
  
  // Salva o estado da sessão
  await page.context().storageState({ path: authFile });
});
