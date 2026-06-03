'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Admin, isAuthenticated as checkAuthenticated } from '@/utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  setIsAuthenticated: (value: boolean) => void;
  setAdmin: (admin: Admin | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    if (checkAuthenticated()) {
      setIsAuthenticated(true);
      const adminStr = localStorage.getItem('admin');
      if (adminStr) {
        setAdmin(JSON.parse(adminStr));
      }
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, admin, setIsAuthenticated, setAdmin }}
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
