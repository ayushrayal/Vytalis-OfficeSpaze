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

  const signup = async ({ name, email, password, accessCode }) => {
    const signupRes = await authService.signup({ name, email, password, accessCode });
    if (!signupRes.success) {
      return signupRes;
    }

    try {
      const loginRes = await authService.login({ email, password });
      if (loginRes.success && loginRes.data?.user) {
        setUser(loginRes.data.user);
      } else {
        await checkAuth();
      }
      return { success: true, autoLoginSuccess: true, data: loginRes.data };
    } catch (loginErr) {
      return {
        success: true,
        autoLoginSuccess: false,
        message: 'Account created successfully. Automatic sign-in failed, please sign in manually.'
      };
    }
  };

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
    signup,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
