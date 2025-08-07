/**
 * Authentication context for managing user state, token storage, and auto-logout
 * Provides authentication state management across the application
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API base URL - should be configurable via environment variables
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Check for stored tokens on app initialization
    const storedToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
      // Verify token and get user info
      verifyTokenAndSetUser(storedToken);
    } else {
      setIsLoading(false);
    }

    // Set up axios interceptor for automatic token inclusion
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Set up response interceptor for automatic token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && accessToken) {
          // Try to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the original request
            const originalRequest = error.config;
            const newToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios.request(originalRequest);
          } else {
            // Refresh failed, logout user
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  const verifyTokenAndSetUser = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setAccessToken(token);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens based on remember me preference
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', access_token);
      storage.setItem('refreshToken', refresh_token);

      setAccessToken(access_token);
      setUser(userData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Login failed');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Registration failed');
      }
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: storedRefreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;

      // Update tokens in the same storage location
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
      storage.setItem('accessToken', access_token);
      storage.setItem('refreshToken', newRefreshToken);

      setAccessToken(access_token);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = (): void => {
    // Clear tokens from both storage locations
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    setAccessToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    register,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};