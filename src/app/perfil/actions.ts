'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('fullName') as string
  const avatarUrl = formData.get('avatarUrl') as string

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {})
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/perfil')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres' }
  }

  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Não autorizado' }
  }

  // Se não tiver a chave service_role no env, vai falhar a exclusão admin
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY não encontrada. A exclusão de usuário pode falhar.");
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Erro ao excluir usuário:', deleteError)
    return { error: 'Erro ao excluir conta. Verifique as permissões do servidor.' }
  }

  return { success: true }
}
