import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  role: 'admin' | 'staff' | null;
  login: (role: 'admin' | 'staff') => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null,
      login: (role) => set({ isAuthenticated: true, role }),
      logout: () => set({ isAuthenticated: false, role: null }),
    }),
    {
      name: 'presense-auth', // localStorage key
    }
  )
);
