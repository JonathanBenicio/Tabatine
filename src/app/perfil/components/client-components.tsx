'use client';

import React, { useState } from 'react';
import { LogOut, Send, CheckCircle2, RefreshCw, Bell, AlertCircle } from 'lucide-react';
import { toggleReceiveLogsAction } from '../actions';
import { logout } from '@/app/auth/actions';
import { UserProfile } from '@/types/auth';

export function LogoutButton() {
  return (
    <form action={logout} className="w-full">
      <button 
        type="submit"
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
      >
        <LogOut size={16} />
        Sair da Conta
      </button>
    </form>
  );
}

export function TelegramIntegration({ profile }: { profile: UserProfile | null }) {
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch {
      setError('Erro de conexão.');
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <>
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

      <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/30 mb-6">
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

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 animate-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </>
  );
}

export function ReceiveLogsToggle({ profile }: { profile: UserProfile | null }) {
  const [receiving, setReceiving] = useState(profile?.receive_logs || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (!profile) return;
    const previousState = receiving;
    
    // Otimista: Já inverte na tela imediatamente
    setReceiving(!previousState);
    setSaving(true);
    setError(null);
    try {
      const response = await toggleReceiveLogsAction(previousState);
      setReceiving(response.receive_logs);
    } catch (err: unknown) {
      // Reverte se a API falhar
      setReceiving(previousState);
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferência');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
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
          onClick={toggle}
          disabled={saving || !profile?.telegram_chat_id}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${receiving ? 'bg-blue-600' : 'bg-zinc-700'} ${(!profile?.telegram_chat_id || saving) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className={`${receiving ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
        </button>
      </div>
      
      {error && (
        <div className="px-2">
           <p className="text-xs font-medium text-rose-400">{error}</p>
        </div>
      )}
    </div>
  );
}
