import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://api.akustikkontrol.com.tr/api";

export type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  visibility: "everyone" | "admin";
  is_public: boolean;
  is_own: boolean;
  created_at: string;
};

export async function getProductReviews(slug: string): Promise<Review[]> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/products/${slug}/reviews/`, { cache: "no-store", headers });
  if (!res.ok) throw new Error(`Reviews API failed: ${res.status}`);
  return res.json();
}

export type MyReview = {
  id: number;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  rating: number;
  comment: string;
  visibility: "everyone" | "admin";
  created_at: string;
};

export async function getMyReviews(): Promise<MyReview[]> {
  const token = getAccessToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}/reviews/my/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reviews API failed: ${res.status}`);
  return res.json();
}

export async function submitReview(slug: string, rating: number, comment: string): Promise<Review> {
  const token = getAccessToken();
  if (!token) throw new Error("Yorum yapmak için giriş yapmalısın.");

  const res = await fetch(`${API_BASE}/products/${slug}/reviews/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating, comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Yorum gönderilemedi.");
  }
  return res.json();
}