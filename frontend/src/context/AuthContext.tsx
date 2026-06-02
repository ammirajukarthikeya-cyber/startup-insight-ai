'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ isMfaRequired: boolean; token?: string }>;
  register: (email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  verifyMfa: (email: string, code: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const profile = await api.get<User>('/api/user/profile');
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        await refreshProfile();
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post('/api/auth/login', { email, password });
    if (data.is_mfa_required) {
      return { isMfaRequired: true, token: data.access_token };
    }
    
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', data.role);
    
    await refreshProfile();
    return { isMfaRequired: false };
  };

  const register = async (email: string, password: string) => {
    await api.post('/api/auth/register', { email, password });
  };

  const verifyEmail = async (email: string, code: string) => {
    await api.post('/api/auth/verify-email', { email, code });
  };

  const verifyMfa = async (email: string, code: string) => {
    const data = await api.post('/api/auth/verify-mfa', { email, code });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', data.role);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, verifyMfa, logout, refreshProfile }}>
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
