export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}
