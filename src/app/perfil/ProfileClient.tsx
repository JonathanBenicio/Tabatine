'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { AvatarFileSchema, ProfileNameSchema, ProfilePasswordSchema } from '@/lib/profile-validation';
import { updatePassword, updateProfile } from './actions';

interface ProfileClientProps {
  fullName: string;
  avatarUrl: string;
}
interface Feedback {
  type: 'success' | 'error';
  text: string;
}
const inputClass = 'w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-white';
const buttonClass = 'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';

export default function ProfileClient({ fullName: initialName, avatarUrl: initialAvatar }: ProfileClientProps): React.JSX.Element {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [message, setMessage] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const run = async (operation: () => Promise<void>): Promise<void> => {
    setPending(true);
    setMessage(null);
    try {
      await operation();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.' });
    } finally {
      setPending(false);
    }
  };

  const saveName = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const input = ProfileNameSchema.safeParse({ fullName });
    if (!input.success) { setMessage({ type: 'error', text: input.error.issues[0].message }); return; }
    const data = new FormData(event.currentTarget);
    void run(async (): Promise<void> => {
      const result = await updateProfile(data);
      if (result.error) throw new Error(result.error);
      setMessage({ type: 'success', text: 'Nome atualizado com sucesso.' });
      router.refresh();
    });
  };

  const savePassword = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = ProfilePasswordSchema.safeParse({ password: data.get('password'), confirmPassword: data.get('confirmPassword') });
    if (!input.success) { setMessage({ type: 'error', text: input.error.issues[0].message }); return; }
    void run(async (): Promise<void> => {
      const result = await updatePassword(data);
      if (result.error) throw new Error(result.error);
      form.reset();
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso.' });
    });
  };

  const uploadAvatar = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const input = AvatarFileSchema.safeParse(file);
    if (!input.success) { setMessage({ type: 'error', text: input.error.issues[0].message }); return; }
    void run(async (): Promise<void> => {
      const data = new FormData();
      data.set('file', file);
      const response = await fetch('/api/auth/upload-avatar', { method: 'POST', body: data });
      const result: { publicUrl?: string; error?: string } = await response.json();
      if (!response.ok || !result.publicUrl) throw new Error(result.error ?? 'Não foi possível atualizar a foto.');
      setAvatarUrl(result.publicUrl);
      setMessage({ type: 'success', text: 'Foto atualizada com sucesso.' });
      router.refresh();
    });
  };

  const deleteAccount = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (confirmation !== 'EXCLUIR') return;
    void run(async (): Promise<void> => {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmation }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Não foi possível excluir a conta.');
      router.replace('/auth/login');
      router.refresh();
    });
  };

  return (
    <section aria-label="Editar perfil" className="space-y-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Informações pessoais</h2>
      {message && <p aria-label="Resultado do perfil" role={message.type === 'error' ? 'alert' : 'status'} className={message.type === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{message.text}</p>}
      <div className="flex flex-wrap items-center gap-4">
        {avatarUrl && <Image src={avatarUrl} alt="Sua foto de perfil" width={64} height={64} unoptimized className="rounded-full object-cover" />}
        <div>
          <label htmlFor="profile-avatar" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Foto de perfil</label>
          <input id="profile-avatar" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} disabled={pending} aria-describedby="profile-avatar-help" className="mt-2 block max-w-full text-sm text-slate-700 dark:text-zinc-300" />
          <p id="profile-avatar-help" className="mt-1 text-xs text-slate-500 dark:text-zinc-500">PNG, JPEG ou WebP, até 2 MB.</p>
        </div>
      </div>
      <form onSubmit={saveName} className="space-y-3">
        <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Nome completo</label>
        <input id="profile-name" name="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={100} required disabled={pending} autoComplete="name" className={inputClass} />
        <button type="submit" disabled={pending} className={buttonClass}>{pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Salvar nome</button>
      </form>
      <form onSubmit={savePassword} className="space-y-3 border-t border-slate-200 dark:border-zinc-800 pt-6">
        <h3 className="font-semibold text-slate-900 dark:text-white">Alterar senha</h3>
        <label htmlFor="profile-password" className="block text-sm text-slate-700 dark:text-zinc-300">Nova senha</label>
        <input id="profile-password" name="password" type="password" minLength={8} maxLength={128} required disabled={pending} autoComplete="new-password" className={inputClass} />
        <label htmlFor="profile-password-confirmation" className="block text-sm text-slate-700 dark:text-zinc-300">Confirmar nova senha</label>
        <input id="profile-password-confirmation" name="confirmPassword" type="password" required disabled={pending} autoComplete="new-password" className={inputClass} />
        <p className="text-xs text-slate-500 dark:text-zinc-500">Use pelo menos 8 caracteres.</p>
        <button type="submit" disabled={pending} className={buttonClass}>Atualizar senha</button>
      </form>
      <form onSubmit={deleteAccount} className="space-y-3 border-t border-rose-200 dark:border-rose-900 pt-6">
        <h3 className="font-semibold text-rose-600 dark:text-rose-400">Excluir conta</h3>
        <p className="text-sm text-slate-600 dark:text-zinc-400">Esta ação remove sua conta de acesso e suas fotos de perfil e não pode ser desfeita.</p>
        <label htmlFor="profile-delete" className="block text-sm text-slate-700 dark:text-zinc-300">Digite EXCLUIR para confirmar</label>
        <input id="profile-delete" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={pending} autoComplete="off" className={inputClass} />
        <button type="submit" disabled={pending || confirmation !== 'EXCLUIR'} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Excluir minha conta</button>
      </form>
    </section>
  );
}
