export interface ActivationPackage {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  allowed_features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ActivationPayment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_reference?: string;
  meta_data?: {
    proof_filename?: string;
    proof_uploaded?: boolean;
  };
  created_at: string;
  user_id: number;
  user_name: string;
  user_email: string;
  package_name: string;
}

export interface PackageFormData {
  name: string;
  description: string;
  price: string;
  duration_days: string;
  features: string;
  allowed_features: string[];
  is_active: boolean;
}
