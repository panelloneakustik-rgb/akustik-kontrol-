import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000/api";

export type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
};

export async function getProductReviews(slug: string): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/products/${slug}/reviews/`, { cache: "no-store" });
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