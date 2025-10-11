import api from "./api";
import type {
  User,
  CreateUserInput,
  LoginInput,
  AuthResponse,
  UserResponse,
} from "../types";

// Token storage key
const TOKEN_KEY = "authToken";

/**
 * Register a new user
 * @param email - User email
 * @param password - User password
 * @param fullName - User full name
 * @returns Promise with user and token
 */
export const register = async (
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User; token: string }> => {
  const payload: CreateUserInput = { email, password, fullName };
  const response: AuthResponse = await api.post("/auth/register", payload);

  // Store token in localStorage
  setToken(response.token);

  return {
    user: response.user,
    token: response.token,
  };
};

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns Promise with user and token
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const payload: LoginInput = { email, password };
  const response: AuthResponse = await api.post("/auth/login", payload);

  // Store token in localStorage
  setToken(response.token);

  return {
    user: response.user,
    token: response.token,
  };
};

/**
 * Logout user - clears localStorage
 */
export const logout = (): void => {
  removeToken();

  // Optional: Call backend logout endpoint for any server-side cleanup
  // Note: This is fire-and-forget since JWT tokens are stateless
  try {
    api.post("/auth/logout").catch(() => {
      // Ignore errors since logout should work even if server is unreachable
    });
  } catch {
    // Ignore errors
  }
};

/**
 * Get current user information
 * @returns Promise with current user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response: UserResponse = await api.get("/auth/me");
  return response.user;
};

/**
 * Get token from localStorage
 * @returns Token string or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Save token to localStorage
 * @param token - JWT token to store
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  // Optional: Add token expiration check here
  // For now, we just check if token exists
  try {
    // You could decode JWT and check expiration here
    // const decoded = jwt.decode(token);
    // return decoded && decoded.exp > Date.now() / 1000;
    return true;
  } catch {
    return false;
  }
};

// Default export with all functions
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
};

export default authService;
