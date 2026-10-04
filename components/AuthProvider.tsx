"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  cacheUser,
  fetchMe,
  getCachedUser,
  hasSession,
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
  const bootId = useRef(0);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached && hasSession()) {
      setUser(cached);
      setLoading(false);
    }

    const id = bootId.current;
    let cancelled = false;
    fetchMe()
      .then((u) => {
        if (cancelled || bootId.current !== id) return;
        if (u) {
          setUser(u);
        } else if (!hasSession()) {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled || bootId.current !== id) return;
        if (!hasSession()) setUser(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    bootId.current += 1;
    const u = await apiLogin(email, password);
    setUser(u);
    setLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, passwordConfirm: string) => {
    bootId.current += 1;
    const u = await apiRegister(email, password, fullName, passwordConfirm);
    setUser(u);
    setLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    bootId.current += 1;
    const u = await apiLoginWithGoogle(idToken);
    setUser(u);
    setLoading(false);
  }, []);

  const updateProfile = useCallback(async (fields: { first_name?: string; last_name?: string }) => {
    const u = await apiUpdateProfile(fields);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    bootId.current += 1;
    apiLogout();
    cacheUser(null);
    setUser(null);
    setLoading(false);
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
