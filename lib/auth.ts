const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000/api";
const ACCESS_KEY = "ndesign_access_token";
const REFRESH_KEY = "ndesign_refresh_token";

export type AuthUser = { id: number; email: string; first_name: string; last_name: string; full_name: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
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
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
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
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await request<{ user: AuthUser; access: string; refresh: string }>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveTokens(data.access, data.refresh);
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
  return data.user;
}

export async function fetchMe(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return await request<AuthUser>("/auth/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    clearTokens();
    return null;
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
  return request<AuthUser>("/auth/me/", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(fields),
  });
}