'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { ProfileNameSchema, ProfilePasswordSchema } from '@/lib/profile-validation';

interface ProfileActionResult {
  success?: boolean;
  error?: string;
}

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const input = ProfileNameSchema.safeParse({ fullName: formData.get('fullName') });
  if (!input.success) return { error: input.error.issues[0].message };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Faça login para continuar.' };
  const { data, error } = await supabase.from('perfis')
    .update({ nome: input.data.fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id).select('id').maybeSingle();
  if (error || !data) {
    console.error('Profile update failed:', error?.code ?? 'profile_not_found');
    return { error: 'Não foi possível atualizar seu nome. Tente novamente.' };
  }
  revalidatePath('/perfil');
  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<ProfileActionResult> {
  const input = ProfilePasswordSchema.safeParse({ password: formData.get('password'), confirmPassword: formData.get('confirmPassword') });
  if (!input.success) return { error: input.error.issues[0].message };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Faça login para continuar.' };
  const { error } = await supabase.auth.updateUser({ password: input.data.password });
  if (error) {
    console.error('Password update failed:', error.code);
    return { error: 'Não foi possível atualizar sua senha. Tente novamente.' };
  }
  return { success: true };
}

export async function toggleReceiveLogsAction(currentValue: boolean) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Usuário não autenticado.');
  }

  const newValue = !currentValue;

  const { error } = await supabase
    .from('perfis')
    .update({ receive_logs: newValue, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/perfil');
  return { receive_logs: newValue };
}
