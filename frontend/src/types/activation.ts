export interface ActivationPackage {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface UserActivation {
  id: number;
  user_id: number;
  package_id?: number;
  status: 'inactive' | 'pending_payment' | 'active' | 'suspended';
  package?: ActivationPackage;
  activation_fee?: number;
  payment_transaction_id?: number;
  activated_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}
