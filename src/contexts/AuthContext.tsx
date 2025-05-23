'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  company: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  businessType: string;
  industry: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in when app loads
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.data);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const signup = async (userData: SignupData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post('/api/auth/register', userData);
      if (res.data.success) {
        setUser(res.data.data);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        clearError,
      }}
    >
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
