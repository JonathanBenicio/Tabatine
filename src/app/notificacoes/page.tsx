"use client";

import React, { useEffect } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Bell, CheckCircle2, FileText, AlertCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import axios from "axios";

export default function NotificationsPage() {
  const { notifications, fetchRecent, startPolling, stopPolling } = useNotificationStore();

  useEffect(() => {
    startPolling(5000);
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const simulateWebhook = async () => {
    try {
      await axios.post("/api/webhooks/omie", {
        topic: "NotaFiscal.Emitida",
        data: {
          numero_nf: Math.floor(Math.random() * 10000).toString(),
          valor_total: (Math.random() * 5000).toFixed(2),
          cliente: "Cliente Simulado S/A",
          data_emissao: new Date().toLocaleDateString("pt-BR"),
        },
      });
      fetchRecent();
    } catch (error) {
      console.error("Erro ao simular webhook:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Centro de Notificações
            </h1>
            <p className="text-slate-400 mt-1">Acompanhe em tempo real a emissão de Notas Fiscais via Webhook.</p>
          </div>
          <button
            onClick={simulateWebhook}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-indigo-900/20 active:scale-95"
          >
            <Send size={18} />
            Simular Webhook
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Recebido</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Status Conexão</p>
              <p className="text-lg font-bold text-emerald-400">Monitorando...</p>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Última NF</p>
              <p className="text-lg font-bold">
                {notifications[0] ? `NF #${notifications[0].payload.data?.numero_nf || '?'}` : 'Nenhuma'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Feed de Eventos
            {notifications.length > 0 && (
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 animate-pulse">
                Ao Vivo
              </span>
            )}
          </h2>

          {notifications.length === 0 ? (
            <div className="bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">Aguardando notificações do webhook da Omie...</p>
              <p className="text-slate-500 text-sm mt-2">Use o botão de simular acima para ver a mágica acontecer.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className={`group relative overflow-hidden bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl transition-all duration-500 hover:border-blue-500/50 hover:bg-slate-800/60 ${
                    index === 0 ? 'animate-in' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="mt-1 w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100 italic">
                            NF-e Emitida: #{notif.payload.data?.numero_nf || 'N/A'}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                            {notif.payload.topic || 'WEBHOOK'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Cliente: <span className="text-slate-200">{notif.payload.data?.cliente || 'Não informado'}</span>
                        </p>
                        <p className="text-sm text-slate-400">
                          Valor: <span className="text-emerald-400 font-medium">R$ {notif.payload.data?.valor_total || '0,00'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-mono">
                        {format(new Date(notif.timestamp), "HH:mm:ss", { locale: ptBR })}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        {format(new Date(notif.timestamp), "dd MMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeInSlide 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
