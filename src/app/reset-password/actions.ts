'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const nextParam = formData.get('next') as string || '/dashboard'

  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent('As senhas não coincidem.')}&next=${encodeURIComponent(nextParam)}`)
  }

  if (password.length < 8) {
    redirect(`/reset-password?error=${encodeURIComponent('A senha precisa ter pelo menos 8 caracteres.')}&next=${encodeURIComponent(nextParam)}`)
  }

  // Update logic using established session natively via createServerClient cookies
  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    console.error('Update password error:', error.message)
    redirect(`/reset-password?error=${encodeURIComponent('Falha ao atualizar a senha: ' + error.message)}&next=${encodeURIComponent(nextParam)}`)
  }

  // Se tudo correr bem, redireciona para o login com sucesso
  redirect('/auth/login?msg=Senha+redefinida+com+sucesso')
}
