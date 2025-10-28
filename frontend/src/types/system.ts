export interface SystemSettings {
  registration_enabled: boolean;
  activation_packages_enabled: boolean;
  kyc_required: boolean;
  daily_withdrawal_limit: number;
  weekly_withdrawal_limit: number;
  monthly_withdrawal_limit: number;
  access_token_expire_minutes: number;
  refresh_token_expire_days: number;
  default_sponsor_id?: number;
}

export interface SystemSettingsUpdate {
  registration_enabled?: string;
  activation_packages_enabled?: string;
  kyc_required?: string;
  daily_withdrawal_limit?: string;
  weekly_withdrawal_limit?: string;
  monthly_withdrawal_limit?: string;
  access_token_expire_minutes?: string;
  refresh_token_expire_days?: string;
  default_sponsor_id?: string;
}
