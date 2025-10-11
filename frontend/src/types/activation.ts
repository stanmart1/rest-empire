export interface ActivationPackage {
  package: 'starter' | 'professional' | 'premium';
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
}

export interface UserActivation {
  id: number;
  user_id: number;
  status: 'inactive' | 'pending_payment' | 'active' | 'suspended';
  package?: 'starter' | 'professional' | 'premium';
  activation_fee?: number;
  activated_at?: string;
  expires_at?: string;
  created_at: string;
}
