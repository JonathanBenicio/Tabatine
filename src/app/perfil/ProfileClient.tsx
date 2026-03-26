'use client';

import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Camera, Save, Loader2, Trash2, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateProfile, updatePassword, deleteAccount } from './actions';

export default function ProfileClient({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const router = useRouter();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('avatarUrl', avatarUrl);

      const result = await updateProfile(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error as Error).message || 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upload da imagem.');
      }

      setAvatarUrl(data.publicUrl);
      setMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error as Error).message || 'Erro ao fazer upload da imagem.' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    try {
      setChangingPassword(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('password', newPassword);

      const result = await updatePassword(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error as Error).message || 'Erro ao atualizar senha' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'EXCLUIR') {
      setMessage({ type: 'error', text: 'Digite EXCLUIR para confirmar a exclusão' });
      return;
    }

    try {
      setDeletingAccount(true);
      setMessage(null);

      // Usar a rota da API para exclusão (ou action)
      const result = await deleteAccount();

      if (result.error) {
        throw new Error(result.error);
      }

      // Redireciona para login após sair
      router.push('/auth/login');
      router.refresh();

    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error as Error).message || 'Erro ao excluir conta' });
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-medium mb-6">Informações Pessoais</h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center relative z-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-zinc-500">{fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}</span>
                )}

                <label
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity z-10"
                  htmlFor="single"
                >
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                </label>
              </div>

              <input
                style={{
                  visibility: 'hidden',
                  position: 'absolute',
                }}
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
              />
            </div>
            <p className="text-xs text-zinc-500">Clique para alterar a foto</p>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
              <input
                type="text"
                value={user.email || ''}
                disabled
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-zinc-500 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500 mt-1">O e-mail não pode ser alterado por aqui.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Key className="w-5 h-5 text-zinc-400 mr-2" />
          <h2 className="text-lg font-medium">Segurança</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword || !newPassword}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
          >
            {changingPassword ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Atualizar Senha
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Trash2 className="w-5 h-5 text-rose-500 mr-2" />
          <h2 className="text-lg font-medium text-rose-500">Excluir Conta</h2>
        </div>

        <p className="text-sm text-zinc-400 mb-4">
          Atenção: A exclusão da sua conta é uma ação irreversível. Todos os seus dados, configurações e acessos serão permanentemente apagados.
        </p>

        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Digite <span className="text-white font-bold">EXCLUIR</span> para confirmar</label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500 transition-colors"
              placeholder="EXCLUIR"
            />
          </div>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount || deleteConfirmation !== 'EXCLUIR'}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:hover:bg-rose-500"
          >
            {deletingAccount ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Excluir Minha Conta
          </button>
        </div>
      </div>
    </div>
  );
}
