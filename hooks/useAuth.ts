// src/hooks/useAuth.ts

import {
  getProfile,
  isAuthenticated,
  loginUser,
  logoutUser,
  registerUser,
} from "@/api/auth/user.service";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    const authenticated = await isAuthenticated();
    if (authenticated) {
      const currentUser = await getProfile();
      setUser(currentUser);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const result = await loginUser({ email, password });
    if (result.success && result.user) {
      setUser(result.user);
      setIsLoggedIn(true);
    }
    return result;
  };

  const register = async (userData: any) => {
    return await registerUser(userData);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsLoggedIn(false);
  };

  return {
    user,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    isAdmin: user?.role === "admin",
    role: user?.role,
  };
};
