import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { login } from '../actions';
import Link from 'next/link';
import { SubmitButton } from '@/components/SubmitButton';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const errorMessage = searchParams?.error as string | undefined;
  const successMessage = searchParams?.msg as string | undefined;
  const nextUrl = searchParams?.next as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">

        {/* Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Omie <span className="text-zinc-500 font-medium">Connect</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            Faça login para acessar sua conta
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 p-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form action={login} className="space-y-4">
          {nextUrl && <input type="hidden" name="next" value={nextUrl} />}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="exemplo@tabatine.com"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
                Senha
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <SubmitButton
            loadingText="Entrando..."
            className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Entrar
          </SubmitButton>
        </form>

      </div>
    </div>
  );
}
