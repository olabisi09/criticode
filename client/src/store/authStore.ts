import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
  getToken,
  isAuthenticated as checkIsAuthenticated,
  removeToken,
} from "../services/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const result = await authLogin(email, password);

          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        try {
          set({ isLoading: true });

          const result = await authRegister(email, password, fullName);

          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Call auth service logout to clear localStorage and notify backend
        authLogout();

        // Clear store state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });

          // Check if token exists in localStorage
          const storedToken = getToken();

          if (!storedToken || !checkIsAuthenticated()) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Get current user from backend
          const user = await getCurrentUser();

          set({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // If there's an error (e.g., token expired), clear auth state
          console.error("Auth check failed:", error);

          // Clear invalid token
          removeToken();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-store", // localStorage key
      partialize: (state) => ({
        // Only persist user and token, not loading states
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration from localStorage, check auth status
        if (state) {
          // Verify token is still valid by checking localStorage directly
          const token = getToken();
          const isAuth = checkIsAuthenticated();

          // Update state based on actual localStorage state
          state.token = token;
          state.isAuthenticated = isAuth && !!token && !!state.user;

          // If we have a token but need to verify user, trigger checkAuth
          if (token && isAuth && state.user) {
            // Optionally trigger a background auth check
            // This could be done in a useEffect in the main App component
          } else if (!token || !isAuth) {
            // Clear state if no valid token
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

// Helper hook to get current user
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};

// Helper hook to check loading state
export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};

export default useAuthStore;
