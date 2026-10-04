import { getAccessToken } from "@/lib/auth";
import { API_BASE } from "@/lib/config";

export type Address = {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  phone: string;
  mobile_phone: string;
  city: string;
  district: string;
  address: string;
  is_default: boolean;
  created_at: string;
};

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Adres API ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function listAddresses() {
  return request<Address[]>("/auth/addresses/");
}

export function createAddress(data: Omit<Address, "id" | "created_at">) {
  return request<Address>("/auth/addresses/", { method: "POST", body: JSON.stringify(data) });
}

export function updateAddress(id: number, data: Partial<Address>) {
  return request<Address>(`/auth/addresses/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteAddress(id: number) {
  return request<void>(`/auth/addresses/${id}/`, { method: "DELETE" });
}
