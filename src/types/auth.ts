export interface UserProfile {
  id: string;
  nome: string | null;
  telegram_chat_id: string | null;
  receive_logs: boolean;
  created_at?: string;
  updated_at?: string;
}
