import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KeyRound, AlertCircle } from 'lucide-react'
import { updatePassword } from './actions'

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  // Ensure the user actually has a valid session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?error=Necessario+autenticar')
  }

  const errorMessage = searchParams?.error as string | undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white text-center">
            Definir Senha
          </h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            Crie uma senha segura para a sua conta
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form action={updatePassword} className="space-y-4">
          <input type="hidden" name="next" value={searchParams?.next || '/dashboard'} />
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Nova Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Salvar e Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
