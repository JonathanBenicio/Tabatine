export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 text-center">
      <div className="max-w-md bg-zinc-900/50 border border-red-500/50 rounded-2xl p-8 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Erro na Autenticação</h1>
        <p className="text-zinc-400 mb-6">
          Ocorreu um erro ao processar seu login com o Google. O código de autorização é inválido ou expirou.
        </p>
        <a
          href="/auth/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Voltar para o Login
        </a>
      </div>
    </div>
  );
}
