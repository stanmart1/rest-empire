export interface CryptoSignal {
  id: number;
  coin: string;
  signal_type: string;
  entry_price: string;
  target_price?: string;
  stop_loss?: string;
  current_price?: string;
  status: string;
  description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface CryptoSignalCreate {
  coin: string;
  signal_type: string;
  entry_price: string;
  target_price?: string;
  stop_loss?: string;
  description?: string;
  is_published: boolean;
}

export interface CryptoSignalUpdate {
  current_price?: string;
  target_price?: string;
  stop_loss?: string;
  status?: string;
  description?: string;
  is_published?: boolean;
}
