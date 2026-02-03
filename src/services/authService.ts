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

  async logout() {
    // Assuming backend also has a logout endpoint, typically:
    // await api.post('/auth/logout');
    // For now, we just handle client-side state in the store.
  }
};
