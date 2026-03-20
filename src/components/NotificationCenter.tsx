import React, { useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { 
  Bell, 
  Check, 
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
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
          <div className="absolute right-0 mt-2 w-80 max-h-[480px] flex flex-col rounded-lg bg-[#1a1a1a] border border-[#333] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#333]">
              <h3 className="font-semibold text-white">Notificações</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Lido
                </button>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Nenhuma notificação por aqui.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`p-4 border-b border-[#262626] hover:bg-[#262626] transition-colors cursor-pointer group ${!notification.is_read ? 'bg-[#1e1e1e]' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-white' : 'text-gray-400'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-gray-600 whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 text-center border-t border-[#333] bg-[#1a1a1a]">
                 <button className="text-xs text-gray-500 hover:text-white transition-colors">
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
