import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@/api/entities.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = async () => {
    try {
      const current = await User.me();
      setUser(current);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials) => {
    const result = await User.login(credentials);
    setUser(result.user);
    setError(null);
    return result;
  };

  const register = async (payload) => {
    const newUser = await User.register(payload);
    setError(null);
    return newUser;
  };

  const logout = async () => {
    await User.logout();
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    return User.requestPasswordReset(email);
  };

  const resetPassword = async (token, newPassword) => {
    return User.resetPassword(token, newPassword);
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    requestPasswordReset,
    resetPassword,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
