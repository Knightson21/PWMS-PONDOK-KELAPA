import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isChangePasswordModalOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const { user } = await api.getMe();
        setUser(user);
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (phone: string, pass: string): Promise<User> => {
    const res = await api.login(phone, pass);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsLoginModalOpen(false);
    return res.user;
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { user } = await api.getMe();
      setUser(user);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        isChangePasswordModalOpen,
        openChangePasswordModal: () => setIsChangePasswordModalOpen(true),
        closeChangePasswordModal: () => setIsChangePasswordModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
