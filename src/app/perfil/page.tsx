import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex-1 p-8 text-white max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie suas informações pessoais e configurações de conta</p>
      </div>

      <ProfileClient user={user} />
    </div>
  )
}
