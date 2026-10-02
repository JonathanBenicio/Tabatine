import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

/**
 * Verifica se o usuário autenticado possui a role de administrador.
 * Redireciona para login se não autenticado, ou para dashboard se não autorizado.
 *
 * Utiliza `app_metadata.role` do Supabase Auth, que é um campo confiável
 * (somente o service_role/admin pode alterar via API, não o próprio usuário).
 *
 * @returns O objeto User autenticado e autorizado.
 * @throws Redirect para '/login' ou '/dashboard?error=forbidden'
 *
 * @example
 * // Em um Server Component (Page)
 * export default async function AdminPage() {
 *   await requireAdmin();
 *   return <div>Admin Content</div>;
 * }
 *
 * // Em uma API Route
 * export async function GET() {
 *   await requireAdmin();
 *   // ...
 * }
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // app_metadata é definido server-side e não pode ser adulterado pelo usuário
  const isAdmin = user.app_metadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/dashboard?error=forbidden');
  }

  return user;
}
