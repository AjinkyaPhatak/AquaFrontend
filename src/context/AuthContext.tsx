'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await apiService.getMe();
    if (data && !error) {
      setUser(data);
    } else {
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] Login attempt for:', email);
    const { data, error } = await apiService.login(email, password);
    
    if (error) {
      console.error('[AuthContext] Login failed:', error);
      return { success: false, error };
    }

    if (data) {
      console.log('[AuthContext] Login successful, storing token and user data');
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      return { success: true };
    }

    console.error('[AuthContext] Login failed: No data received');
    return { success: false, error: 'Login failed' };
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('[AuthContext] Register attempt for:', email);
    const { data, error } = await apiService.register(name, email, password);
    
    if (error) {
      console.error('[AuthContext] Registration failed:', error);
      return { success: false, error };
    }

    if (data) {
      console.log('[AuthContext] Registration successful, storing token and user data');
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      return { success: true };
    }

    console.error('[AuthContext] Registration failed: No data received');
    return { success: false, error: 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    const { data } = await apiService.getMe();
    if (data) {
      setUser(data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
