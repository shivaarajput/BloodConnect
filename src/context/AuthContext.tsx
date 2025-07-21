
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { User } from '@/types';

// We will use our User type for authUser to keep it simple and consistent.
interface AuthContextType {
  authUser: User | null;
  setAuthUser: (user: User | null) => void; // Simplified signature
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  setAuthUser: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On initial load, try to get user from localStorage to persist session
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        setAuthUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth user from localStorage", error);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  }, []);

  // Custom setter to also update localStorage
  const setAuthUser = (user: User | null) => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
    setAuthUserState(user);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
