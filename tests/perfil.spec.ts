import { createClient } from '@supabase/supabase-js';
import { test, expect } from './fixtures/test';

test.describe('Perfil: contrato e segurança', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/perfil'); });

  test('preserva Telegram e logs junto dos novos formulários', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Meu Perfil' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Informações pessoais' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Telegram Integration' })).toBeVisible();
    await expect(page.getByText('Logs do Sistema', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sair da Conta' })).toBeVisible();
  });

  test('rejeita senhas divergentes antes de chamar o servidor', async ({ page }) => {
    await page.getByLabel('Nova senha', { exact: true }).fill('password-123');
    await page.getByLabel('Confirmar nova senha').fill('other-password');
    await page.getByRole('button', { name: 'Atualizar senha' }).click();
    await expect(page.getByRole('alert', { name: 'Resultado do perfil' })).toHaveText('As senhas não coincidem.');
    await expect(page.getByLabel('Nova senha', { exact: true })).toHaveAttribute('minlength', '8');
  });

  test('rejeita SVG no formulário e conteúdo falso no backend', async ({ page }) => {
    await page.getByLabel('Foto de perfil').setInputFiles({ name: 'avatar.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
    await expect(page.getByRole('alert', { name: 'Resultado do perfil' })).toHaveText('Use uma imagem PNG, JPEG ou WebP.');
    const response = await page.request.post('/api/auth/upload-avatar', {
      multipart: { file: { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') } },
    });
    expect(response.status()).toBe(400);
  });

  test('exclusão exige confirmação e rejeita pedido inválido sem remover a conta', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Excluir minha conta' });
    await expect(button).toBeDisabled();
    await page.getByLabel('Digite EXCLUIR para confirmar').fill('excluir');
    await expect(button).toBeDisabled();
    const response = await page.request.post('/api/auth/delete-account', { data: { confirmation: 'wrong' } });
    expect(response.status()).toBe(400);
    await page.getByLabel('Digite EXCLUIR para confirmar').fill('EXCLUIR');
    await expect(button).toBeEnabled();
  });

  test('salva e recarrega o nome canônico e restaura o dado de teste', async ({ page }) => {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
    const { data: auth, error: authError } = await client.auth.signInWithPassword({ email: process.env.PLAYWRIGHT_TEST_EMAIL!, password: process.env.PLAYWRIGHT_TEST_PASSWORD! });
    expect(authError).toBeNull();
    const { data: original, error } = await client.from('perfis').select('nome').eq('id', auth.user!.id).single();
    expect(error).toBeNull();
    try {
      await page.getByLabel('Nome completo').fill('Validação de Perfil');
      await page.getByRole('button', { name: 'Salvar nome' }).click();
      await expect(page.getByRole('status')).toHaveText('Nome atualizado com sucesso.');
      await page.reload();
      await expect(page.getByLabel('Nome completo')).toHaveValue('Validação de Perfil');
      await expect(page.getByRole('heading', { name: 'Validação de Perfil' })).toBeVisible();
    } finally {
      const { error: restoreError } = await client.from('perfis').update({ nome: original!.nome }).eq('id', auth.user!.id);
      expect(restoreError).toBeNull();
      await client.auth.signOut({ scope: 'local' });
    }
  });

  test('upload atualiza a interface com resposta controlada, sem gravar no Storage', async ({ page }) => {
    await page.route('**/api/auth/upload-avatar', async (route) => { await route.fulfill({ json: { publicUrl: '/favicon.ico' } }); });
    await page.getByLabel('Foto de perfil').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) });
    await expect(page.getByRole('status')).toHaveText('Foto atualizada com sucesso.');
    await expect(page.getByAltText('Sua foto de perfil')).toHaveAttribute('src', '/favicon.ico');
  });

  test('ações administrativas não aceitam visitante sem sessão', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    try {
      expect(await context.cookies()).toEqual([]);
      expect((await context.request.post('http://localhost:3000/api/auth/delete-account', { data: { confirmation: 'EXCLUIR' } })).status()).toBe(401);
      expect((await context.request.post('http://localhost:3000/api/auth/upload-avatar')).status()).toBe(401);
    } finally { await context.close(); }
  });
});
