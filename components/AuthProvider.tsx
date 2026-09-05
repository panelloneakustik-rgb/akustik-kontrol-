"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  fetchMe,
  login as apiLogin,
  register as apiRegister,
  loginWithGoogle as apiLoginWithGoogle,
  updateProfile as apiUpdateProfile,
  logout as apiLogout,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, passwordConfirm: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  updateProfile: (fields: { first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, passwordConfirm: string) => {
    const u = await apiRegister(email, password, fullName, passwordConfirm);
    setUser(u);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const u = await apiLoginWithGoogle(idToken);
    setUser(u);
  }, []);

  const updateProfile = useCallback(async (fields: { first_name?: string; last_name?: string }) => {
    const u = await apiUpdateProfile(fields);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}