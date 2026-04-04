'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleReceiveLogsAction(userId: string, currentValue: boolean) {
  const supabase = await createClient();
  const newValue = !currentValue;

  const { error } = await supabase
    .from('perfis')
    .update({ receive_logs: newValue, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/perfil');
  return { receive_logs: newValue };
}
