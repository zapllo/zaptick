"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  isOwner: boolean;
  companyId: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    name: string, 
    email: string, 
    password: string, 
    companyName: string,
    companyWebsite?: string,
    companyLocation?: string,
    companyIndustry?: string,
    companyCategory?: string,
    companyPhone?: string,
    companyCountryCode?: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored token on load
    const checkUserLoggedIn = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Updated login function to return user data for role-based redirection
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const userData = data.user;
      setUser(userData);
      
      // Return user data so calling component can handle redirection
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    companyName: string,
    companyWebsite?: string,
    companyLocation?: string,
    companyIndustry?: string,
    companyCategory?: string,
    companyPhone?: string,
    companyCountryCode?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          companyName,
          companyWebsite,
          companyLocation,
          companyIndustry,
          companyCategory,
          companyPhone,
          companyCountryCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      router.push('/signup/whatsapp');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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