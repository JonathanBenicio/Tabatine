import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckCheck, 
  ShoppingCart, 
  FileText, 
  Info,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PEDIDO': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'NF': return <FileText className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 gap-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-80 max-h-[480px] flex flex-col rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notificações</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3 h-3" />
                  Lido
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-gray-500 text-sm">
                  Nenhuma notificação por aqui.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`p-4 border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group ${!notification.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-gray-600 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 text-center border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                 <button className="text-xs text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white transition-colors font-medium">
                    Ver todas as notificações
                 </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
