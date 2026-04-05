'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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
