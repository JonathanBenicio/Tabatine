import { test, expect } from './fixtures/test';

// Utilizando variáveis de ambiente para o login, configuráveis no GitHub Secrets ou no .env.local local
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL || 'seu-email-teste@tabatine.com';
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD || 'SuaSenha123!';

// Forçamos o estado deslogado para este arquivo, ignorando o setup global
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Suite', () => {

  test('Deve redirecionar para a tela de login ao acessar rota protegida sem estar logado', async ({ page }) => {
    // Tenta acessar o dashboard sem estar logado
    await page.goto('/dashboard');
    
    // Deve ser redirecionado para /auth (ou similar, ajustado conforme a rota real do projeto)
    await expect(page).toHaveURL(/.*\/auth/);
    
    // Verifica se os elementos de login estão presentes
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();
  });

  test('Deve falhar ao tentar login com credenciais incorretas', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Preenche credenciais inválidas (ajuste os Label texts conforme a sua UI)
    await page.getByLabel(/e-mail|email/i).fill('email_invalido@teste.com');
    await page.getByLabel(/senha|password/i).fill('senha_errada');
    
    // Clica no botão e aguarda o redirect (ou re-render)
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Aguarda a presença da mensagem de erro de autenticação (regex mais flexível)
    await expect(page.locator('text=E-mail ou senha incorretos').first().or(page.getByText(/credenciais inválidas/i))).toBeVisible();
  });

  test('Deve logar com sucesso e acessar o dashboard', async ({ page }) => {
    // Esse teste depende de um banco de dados real. Certifique-se de ignorar ou avisar caso não haja credenciais.
    test.skip(!process.env.PLAYWRIGHT_TEST_EMAIL, 'Credenciais de teste ausentes no ambiente');

    await page.goto('/auth/login');

    await page.getByLabel(/e-mail|email/i).fill(TEST_EMAIL);
    await page.getByLabel(/senha|password/i).fill(TEST_PASSWORD);
    
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Após o login correto, o usuário deve ser redirecionado ao dashboard
    // Verificamos a URL e a presença do Sidebar/Dashboard element
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /dashboard|resumo/i })).toBeVisible();
  });

  test('Deve realizar o logout corretamente', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_TEST_EMAIL, 'Credenciais de teste ausentes no ambiente');

    // Fluxo longo: Fazer login e depois deslogar
    await page.goto('/auth/login');
    await page.getByLabel(/e-mail|email/i).fill(TEST_EMAIL);
    await page.getByLabel(/senha|password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /entrar|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Localizar botão Sair diretamente na Sidebar
    await page.getByRole('button', { name: /sair/i }).click();

    // Deve ser redirecionado para o auth
    await expect(page).toHaveURL(/.*\/auth/, { timeout: 10000 });

    // RE-LOGIN: Como o logout do Supabase invalida o token no servidor,
    // precisamos gerar um novo token e salvar no user.json para não quebrar os próximos testes da suite.
    await page.goto('/auth/login');
    await page.getByLabel(/e-mail|email/i).fill(TEST_EMAIL);
    await page.getByLabel(/senha|password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /entrar|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await page.context().storageState({ path: 'playwright/.auth/user.json' });
  });
});
