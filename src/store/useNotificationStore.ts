import { create } from "zustand";
import axios from "axios";

export interface WebhookEvent {
  id: string;
  timestamp: string;
  payload: any;
}

interface NotificationState {
  notifications: WebhookEvent[];
  isPolling: boolean;
  addNotification: (notification: WebhookEvent) => void;
  fetchRecent: () => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  let pollingTimer: NodeJS.Timeout | null = null;

  return {
    notifications: [],
    isPolling: false,

    addNotification: (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
      }));
    },

    fetchRecent: async () => {
      try {
        const response = await axios.get<WebhookEvent[]>("/api/webhooks/recent");
        const newEvents = response.data;
        
        set((state) => {
          // Identify events we don't have yet
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const trulyNew = newEvents.filter((event) => !existingIds.has(event.id));
          
          if (trulyNew.length === 0) return state;

          return {
            notifications: [...trulyNew, ...state.notifications].slice(0, 50),
          };
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    },

    startPolling: (intervalMs = 5000) => {
      if (get().isPolling) return;
      
      set({ isPolling: true });
      get().fetchRecent(); // Immediate fetch

      pollingTimer = setInterval(() => {
        get().fetchRecent();
      }, intervalMs);
    },

    stopPolling: () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
      set({ isPolling: false });
    },
  };
});
