'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const nextParam = formData.get('next') as string || '/dashboard'

  if (password !== confirmPassword) {
    redirect(`/set-password?error=${encodeURIComponent('As senhas não coincidem.')}&next=${encodeURIComponent(nextParam)}`)
  }

  if (password.length < 6) {
    redirect(`/set-password?error=${encodeURIComponent('A senha precisa ter pelo menos 6 caracteres.')}&next=${encodeURIComponent(nextParam)}`)
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    console.error('Update password error:', error.message)
    redirect(`/set-password?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextParam)}`)
  }

  // Se tudo correr bem, redireciona o utilizador para onde pretendia ir
  redirect(nextParam.startsWith('/') ? nextParam : `/${nextParam}`)
}
