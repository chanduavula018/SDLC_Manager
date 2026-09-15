import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isDeveloper: boolean;
  isTester: boolean;
  isDevOps: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('neuroforge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.token) {
      localStorage.setItem('auth_token', user.token);
      localStorage.setItem('neuroforge_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('neuroforge_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const response = await apiClient.post<AuthUser>('/auth/login', { email, password });
      const authUser = response.data;
      setUser(authUser);
      return authUser;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid email or password';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('neuroforge_user');
  };

  const role = user?.role?.toUpperCase() || '';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'PROJECT_MANAGER' || role === 'PROJECT MANAGER';
  const isDeveloper = role === 'DEVELOPER';
  const isTester = role === 'TESTER';
  const isDevOps = role === 'DEVOPS_ENGINEER' || role === 'DEVOPS';
  const isClient = role === 'CLIENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        isDeveloper,
        isTester,
        isDevOps,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
