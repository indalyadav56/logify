import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });

            // Store token in localStorage for persistence
            localStorage.setItem('token', data.token);
          } catch (error) {
            set({
              error: (error as Error).message,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        },

        register: async (userData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('http://localhost:8080/v1/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Registration failed');
            }

            const data = await response.json();
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });

            localStorage.setItem('token', data.token);
          } catch (error) {
            set({
              error: (error as Error).message,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        },

        logout: () => {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'auth-storage',
        // Only persist these fields
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
