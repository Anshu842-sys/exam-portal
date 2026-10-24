import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/databaseService';
import { getStoredSupabaseConfig } from '../lib/supabase';
import { AuthContextType, AuthUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'exam_cell_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  const checkConnection = async (): Promise<boolean> => {
    const isConn = await db.checkSupabaseConnection();
    setSupabaseConnected(isConn);
    return isConn;
  };

  useEffect(() => {
    // 1. Check connection
    checkConnection();

    // 2. Load stored session
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.role) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse stored auth session:', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, passwordPlain: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const authUser = await db.authenticate(username, passwordPlain);
      if (authUser) {
        setUser(authUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid username or password. Please verify your credentials.' };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication failed due to server error.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const { isValid } = getStoredSupabaseConfig();
  const isDemoMode = !isValid || !supabaseConnected;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isDemoMode,
        supabaseConnected,
        checkConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
