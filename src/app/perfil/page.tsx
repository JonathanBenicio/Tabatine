import React from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { 
  Mail, 
  ShieldCheck, 
  Send, 
  AlertCircle
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { LogoutButton, TelegramIntegration, ReceiveLogsToggle } from './components/client-components';

export default async function PerfilPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single();

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
                <Image 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=transparent`} 
                  alt="Avatar" 
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized // External SVG
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">{profile?.nome || 'Usuário'}</h3>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
              <Mail size={14} />
              {user?.email}
            </p>
            <div className="mt-6 w-full pt-6 border-t border-zinc-800/50">
               <LogoutButton />
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
              <TelegramIntegration profile={profile} />

              <div className="space-y-6 mt-6">
                <ReceiveLogsToggle profile={profile} />
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
          
        </div>
      </div>
    </div>
  );
}
