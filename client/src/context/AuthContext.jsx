import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetchCurrentUser();
      setUser(response?.data?.user || null);
      return response?.data?.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (formData) => {
    const response = await registerUser(formData);
    const createdUser = response?.data?.user || null;
    setUser(createdUser);
    return response;
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await loginUser(credentials);
    const authenticatedUser = response?.data?.user || null;
    setUser(authenticatedUser);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      register,
      login,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, isLoading, register, login, logout, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
