import { create } from 'zustand';
import { authApi } from '../api';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  checkAuth: async () => {
    const currentUser = get().user;
    if (currentUser) {
      set({ isInitialized: true });
      return;
    }

    const token = localStorage.getItem('nexus_token');
    if (!token) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const data = await authApi.me();
      if (data.success && data.data) {
        set({ user: data.data, isLoading: false, isInitialized: true });
      } else {
        set({ user: null, isLoading: false, isInitialized: true });
      }
    } catch (error) {
      localStorage.removeItem('nexus_token');
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, user: null });
    try {
      const data = await authApi.login(email, password);
      if (data.success && data.data?.user) {
        set({ user: data.data.user, isLoading: false });
        return;
      } else {
        set({ isLoading: false });
        throw new Error(data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null });
    }
  },
}));