import api from '@/lib/api';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  AuthUser,
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from '@/types/auth';

export const authAPI = {
  // Login with JSON (matches backend UserLogin schema)
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/request-password-reset', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Logout (clears httpOnly cookies on backend)
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

export default authAPI;
