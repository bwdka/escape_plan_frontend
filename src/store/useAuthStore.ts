import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    // Set cookies for Middleware access
    Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
    Cookies.set('user_role', user.role, { expires: 7 });
    
    // Also keep in localStorage for client-side persistence if needed, 
    // or just rely on cookies/state. Using both for robustness in this scaffold.
    localStorage.setItem('token', token);
    
    set({ user, token, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user_role');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    
    // Optional: Force reload or redirect to home to clear any sensitive state
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
  },
}));
