import { getApiBase } from "@/lib/config";

const ACCESS_KEY = "ndesign_access_token";
const REFRESH_KEY = "ndesign_refresh_token";
const USER_KEY = "ndesign_auth_user";
const COOKIE_ACCESS = "ak_access";
const COOKIE_REFRESH = "ak_refresh";
const SESSION_DAYS = 30;

export type AuthUser = { id: number; email: string; first_name: string; last_name: string; full_name: string };

class AuthHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function cookieDomain(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host === "akustikkontrol.com.tr" || host.endsWith(".akustikkontrol.com.tr")) {
    return "; Domain=.akustikkontrol.com.tr";
  }
  return "";
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = Math.max(0, Math.floor(days * 86400));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${cookieDomain()}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const piece = part.trim();
    if (piece.startsWith(prefix)) {
      const raw = piece.slice(prefix.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}${cookieDomain()}`;
}

function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / quota */
  }
}

function storageRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const hasBody = options?.body != null;
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthHttpError(
      res.status,
      body.detail ||
        body.email?.[0] ||
        body.password?.[0] ||
        body.password_confirm?.[0] ||
        `Auth API ${path} failed`
    );
  }
  return res.json();
}

export function saveTokens(access: string, refresh: string) {
  storageSet(ACCESS_KEY, access);
  storageSet(REFRESH_KEY, refresh);
  writeCookie(COOKIE_ACCESS, access, SESSION_DAYS);
  writeCookie(COOKIE_REFRESH, refresh, SESSION_DAYS);
}

export function cacheUser(user: AuthUser | null) {
  if (!user) {
    storageRemove(USER_KEY);
    return;
  }
  storageSet(USER_KEY, JSON.stringify(user));
}

export function getCachedUser(): AuthUser | null {
  const raw = storageGet(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed || typeof parsed.email !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTokens() {
  storageRemove(ACCESS_KEY);
  storageRemove(REFRESH_KEY);
  storageRemove(USER_KEY);
  deleteCookie(COOKIE_ACCESS);
  deleteCookie(COOKIE_REFRESH);
}

export function getAccessToken(): string | null {
  return storageGet(ACCESS_KEY) || readCookie(COOKIE_ACCESS);
}

function getRefreshToken(): string | null {
  return storageGet(REFRESH_KEY) || readCookie(COOKIE_REFRESH);
}

export function hasSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const data = await request<{ access: string; refresh?: string }>("/auth/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });
    const access = data.access;
    if (!access) return null;
    saveTokens(access, data.refresh || refresh);
    return access;
  } catch (err) {
    const fatal = err instanceof AuthHttpError && (err.status === 401 || err.status === 403);
    if (fatal) return null;
    throw err;
  }
}

export async function register(email: string, password: string, fullName: string, passwordConfirm: string) {
  const data = await request<{ user: AuthUser; access: string; refresh: string }>("/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      password_confirm: passwordConfirm,
      full_name: fullName,
    }),
  });
  saveTokens(data.access, data.refresh);
  cacheUser(data.user);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await request<{ user: AuthUser; access: string; refresh: string }>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveTokens(data.access, data.refresh);
  cacheUser(data.user);
  return data.user;
}

export function logout() {
  clearTokens();
}

export async function loginWithGoogle(idToken: string) {
  const data = await request<{ user: AuthUser; access: string; refresh: string }>("/auth/google/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
  saveTokens(data.access, data.refresh);
  cacheUser(data.user);
  return data.user;
}

async function fetchMeWithToken(token: string): Promise<AuthUser> {
  return request<AuthUser>("/auth/me/", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchMe(): Promise<AuthUser | null> {
  if (!hasSession()) {
    cacheUser(null);
    return null;
  }

  let token = getAccessToken();
  if (!token) {
    try {
      token = (await refreshAccessToken()) || "";
    } catch {
      return getCachedUser();
    }
    if (!token) {
      clearTokens();
      return null;
    }
  }

  try {
    const user = await fetchMeWithToken(token);
    cacheUser(user);
    return user;
  } catch (err) {
    const unauthorized = err instanceof AuthHttpError && (err.status === 401 || err.status === 403);
    if (!unauthorized) {
      return getCachedUser();
    }
    let next: string | null = null;
    try {
      next = await refreshAccessToken();
    } catch {
      return getCachedUser();
    }
    if (!next) {
      clearTokens();
      return null;
    }
    try {
      const user = await fetchMeWithToken(next);
      cacheUser(user);
      return user;
    } catch (retryErr) {
      const stillAuth =
        retryErr instanceof AuthHttpError && (retryErr.status === 401 || retryErr.status === 403);
      if (stillAuth) {
        clearTokens();
        return null;
      }
      return getCachedUser();
    }
  }
}

export async function requestPasswordReset(email: string) {
  await request<{ detail: string }>("/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(uid: string, token: string, password: string, passwordConfirm: string) {
  await request<{ detail: string }>("/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify({ uid, token, password, password_confirm: passwordConfirm }),
  });
}

export async function updateProfile(fields: { first_name?: string; last_name?: string }): Promise<AuthUser> {
  const token = getAccessToken();
  if (!token) throw new Error("Giriş yapılmamış.");
  const user = await request<AuthUser>("/auth/me/", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(fields),
  });
  cacheUser(user);
  return user;
}
