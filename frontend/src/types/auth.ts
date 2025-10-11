// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  referral_code?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Auth Response Types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  verification_required: boolean;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  current_rank: string;
  is_verified: boolean;
  is_active: boolean;
  referral_code: string;
  sponsor_id?: number;
  registration_date: string;
  balance_eur: number;
  balance_dbsp: number;
  total_earnings: number;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  residence: string;
  terms1: boolean;
  terms2: boolean;
  terms3: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Auth Context Types
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

// Auth State Types
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Validation Schemas (for use with zod)
export interface LoginValidation {
  email: string;
  password: string;
}

export interface RegisterValidation {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  residence: string;
  terms1: boolean;
  terms2: boolean;
  terms3: boolean;
}

// API Error Types
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Token Types
export interface TokenPayload {
  sub: string; // user email
  user_id: number;
  exp: number;
  iat: number;
  type: 'access' | 'refresh';
}

// Auth Status Types
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Route Protection Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  redirectTo?: string;
}

export interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}
