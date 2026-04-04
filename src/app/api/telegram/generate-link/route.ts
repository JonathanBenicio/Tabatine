import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // 1. Obter o usuário logado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
    }

    // 2. Verificar se já existe um token válido (não expirado)
    const { data: perfil } = await supabase
      .from('perfis')
      .select('telegram_link_token, telegram_link_token_expires_at')
      .eq('id', user.id)
      .maybeSingle();

    let token = perfil?.telegram_link_token;
    const now = new Date();
    const expiresAtDate = perfil?.telegram_link_token_expires_at ? new Date(perfil.telegram_link_token_expires_at) : null;

    // Se o token existe e ainda é válido (com margem de 1 minuto de segurança)
    const isTokenValid = token && expiresAtDate && expiresAtDate.getTime() > (now.getTime() + 60000);

    if (!isTokenValid) {
      // 3. Gerar novo UUID único e data de expiração (15 minutos)
      token = uuidv4();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      // 4. Persistir no Supabase na tabela perfis (snake_case)
      // Usamos upsert aqui para garantir que o registro exista, mas apenas atualizamos os campos do token.
      const { error } = await supabase
        .from('perfis')
        .upsert({ 
          id: user.id,
          telegram_link_token: token,
          telegram_link_token_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error('Erro ao gerar token Telegram:', error);
        return NextResponse.json({ error: 'Falha ao salvar token no perfil.' }, { status: 500 });
      }
    }

    // 5. Gerar link
    const botUser = "Tabatine_bot"; 
    const link = `https://t.me/${botUser}?start=${token}`;

    return NextResponse.json({ link });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
