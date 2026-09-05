"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getProductReviews, submitReview, type Review } from "@/lib/reviews";

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function ReviewForm({ slug, onSubmitted }: { slug: string; onSubmitted: (r: Review) => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Lütfen bir puan seçin.");
      return;
    }
    if (!comment.trim()) {
      setError("Lütfen bir yorum yazın.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const review = await submitReview(slug, rating, comment.trim());
      onSubmitted(review);
      setComment("");
      setRating(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorum gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-5 flex flex-col gap-3 mb-8">
      <p className="text-sm font-semibold text-ink">Bu ürünü değerlendir</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const filled = value <= (hoverRating || rating);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${value} yıldız`}
            >
              <Star size={22} className="text-gold" fill={filled ? "currentColor" : "none"} />
            </button>
          );
        })}
      </div>
      <textarea
        placeholder="Ürün hakkındaki düşüncelerini yaz..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="border border-ink/20 px-3 py-2 text-sm resize-none bg-white"
      />
      {error && <p className="text-xs text-burgundy">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-sm font-medium py-2 px-5 transition-colors"
      >
        {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
      </button>
    </form>
  );
}

export default function ProductReviews({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductReviews(slug)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [slug]);

  const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-2xl text-ink">Müşteri Yorumları</h2>
        {reviews.length > 0 && (
          <>
            <StarRow rating={avg} />
            <span className="text-sm text-ink/50">{avg.toFixed(1)} / 5 ({reviews.length} yorum)</span>
          </>
        )}
      </div>

      {user ? (
        <ReviewForm slug={slug} onSubmitted={(r) => setReviews((prev) => [r, ...prev.filter((x) => x.user_name !== r.user_name)])} />
      ) : (
        <p className="text-sm text-ink/60 mb-8">
          Yorum yapmak için{" "}
          <Link href="/giris" className="text-burgundy font-medium hover:underline">
            giriş yapmalısın
          </Link>
          .
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Yükleniyor...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-ink/50">Bu ürün için henüz yorum yapılmamış.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card p-4">
              <StarRow rating={r.rating} size={14} />
              <p className="text-sm text-ink/70 my-2">{r.comment}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-ink/50 font-medium">{r.user_name}</p>
                {r.is_verified_purchase && (
                  <span className="flex items-center gap-1 text-[10px] text-green-700" title="Onaylı satın alma">
                    <BadgeCheck size={12} />
                    Onaylı Alım
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}