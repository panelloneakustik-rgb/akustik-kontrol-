import { getSessionKey } from "@/lib/cart";
import type { Product } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Favorites API ${path} failed: ${res.status}`);
  return res.json();
}

export { getSessionKey };

export function fetchFavorites(sessionKey: string) {
  return request<{ product_ids: number[]; products: Product[] }>(`/favorites/${sessionKey}/`);
}

export function toggleFavorite(sessionKey: string, productId: number) {
  return request<{ favorited: boolean; product_id: number }>(`/favorites/${sessionKey}/toggle/`, {
    method: "POST",
    body: JSON.stringify({ product: productId }),
  });
}