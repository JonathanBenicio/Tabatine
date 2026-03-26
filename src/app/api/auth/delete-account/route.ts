import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Obter o usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Criar um client com o service role para usar a admin API
    const supabaseAdmin = await createClient()
    // Isso é um pouco hacky se NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY estiver sendo usado
    // Idealmente, a rota do server tem o SUPABASE_SERVICE_ROLE_KEY no env

    // Verificar se a chave admin está disponível
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Se não tiver a chave service_role, tenta deletar via RPC se existir
      // ou apenas retorna erro pois a API do admin precisa dela
      console.warn("SUPABASE_SERVICE_ROLE_KEY não encontrada. A exclusão de usuário pode falhar.");
    }

    // Tentar excluir usando a API de admin
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Erro ao excluir usuário:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir conta. Verifique as permissões do servidor.' },
        { status: 500 }
      )
    }

    // Limpar os cookies de sessão após excluir (opcional, o cliente já deve fazer o signOut)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro inesperado ao excluir conta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
