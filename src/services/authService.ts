import api from '@/lib/axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

export const AuthService = {
  async register(data: RegisterRequest) {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getGoogleRedirectUrl(redirect?: string, role?: 'customer' | 'partner') {
    const response = await api.get<{ url: string }>('/auth/google/redirect', {
      params: {
        ...(redirect ? { redirect } : {}),
        ...(role ? { role } : {}),
      },
    });
    return response.data;
  },

  async logout() {
    return await api.post('/auth/logout');
  },

  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/profile', data);
    return response.data;
  }
};
