'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  LogOut, 
  Bell, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUser(user);

        const { data: profile } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profile);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase, router]);

  const handleTelegramLink = async () => {
    setTelegramLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/telegram/generate-link', { method: 'POST' });
      const data = await resp.json();
      if (data.link) {
        window.open(data.link, '_blank');
      } else {
        setError(data.error || 'Erro ao gerar link.');
      }
    } catch (err) {
      setError('Erro de conexão.');
    } finally {
      setTelegramLoading(false);
    }
  };

  const toggleReceiveLogs = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const newValue = !profile.receive_logs;
      const { error } = await supabase
        .from('perfis')
        .update({ receive_logs: newValue, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      setProfile({ ...profile, receive_logs: newValue });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Meu Perfil</h1>
        <p className="text-zinc-500 mt-2">Gerencie suas informações e preferências de notificação.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Info Básica */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 mb-4 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=transparent`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">{profile?.nome || 'Usuário'}</h3>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
              <Mail size={14} />
              {user?.email}
            </p>
            <div className="mt-6 w-full pt-6 border-t border-zinc-800/50">
               <button 
                onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
               >
                 <LogOut size={16} />
                 Sair da Conta
               </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              Segurança
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">Nível de Acesso</p>
                <p className="text-sm font-semibold text-white">Administrador</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">ID Único</p>
                <p className="text-[10px] font-mono text-zinc-400 break-all">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Notificações e Integrações */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Sessão Telegram */}
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Send size={120} className="text-blue-500 -rotate-12" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Send size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Telegram Integration</h3>
                    <p className="text-sm text-zinc-500">Receba alertas em tempo real no seu celular.</p>
                  </div>
                </div>

                {profile?.telegram_chat_id ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Conectado
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-500 border border-zinc-700">
                    Desconectado
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/30">
                  {profile?.telegram_chat_id ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">Chat ID vinculado</p>
                        <p className="text-xs text-zinc-500 mt-1 font-mono">{profile.telegram_chat_id}</p>
                      </div>
                      <button 
                        onClick={handleTelegramLink}
                        disabled={telegramLoading}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        {telegramLoading ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Alterar Vínculo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-4">
                      <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                        Para começar a receber notificações, você precisa vincular sua conta ao nosso Bot oficial.
                      </p>
                      <button 
                        onClick={handleTelegramLink}
                        disabled={telegramLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        {telegramLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                        Vincular Conta Agora
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                      <Bell size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Logs do Sistema</p>
                      <p className="text-xs text-zinc-500 tracking-tight">Receba erros e avisos técnicos em tempo real.</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={toggleReceiveLogs}
                    disabled={saving || !profile?.telegram_chat_id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${profile?.receive_logs ? 'bg-blue-600' : 'bg-zinc-700'} ${(!profile?.telegram_chat_id || saving) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`${profile?.receive_logs ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dicas / Info Adicional */}
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-xl">
             <div className="flex gap-4">
                <AlertCircle className="text-blue-400 shrink-0" size={20} />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-blue-300">Como funciona a vinculação?</h4>
                  <p className="text-xs text-blue-200/60 leading-relaxed">
                    Ao clicar em vincular, você será redirecionado para o Telegram. Basta enviar /start (que já estará preenchido no link) e o bot fará o resto automaticamente. O link expira em 15 minutos por segurança.
                  </p>
                </div>
             </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-4">
              <AlertCircle size={20} />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
