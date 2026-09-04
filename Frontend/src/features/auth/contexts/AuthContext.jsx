import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return true;
      }
    } catch (error) {
      try {
        await authService.refreshToken();
        const meRes = await authService.getCurrentUser();
        if (meRes.success && meRes.data?.user) {
          setUser(meRes.data.user);
          return true;
        }
      } catch (refreshError) {
        setUser(null);
        return false;
      }
    }
    setUser(null);
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (isMounted && res.success && res.data?.user) {
          setUser(res.data.user);
        }
      } catch (error) {
        try {
          await authService.refreshToken();
          const meRes = await authService.getCurrentUser();
          if (isMounted && meRes.success && meRes.data?.user) {
            setUser(meRes.data.user);
          }
        } catch (refreshError) {
          if (isMounted) {
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    } else {
      // Fallback fetch /me if user object wasn't in login payload
      await checkAuth();
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
