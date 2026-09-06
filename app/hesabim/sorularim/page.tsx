"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getMyReviews, type MyReview } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold text-sm tracking-tight" aria-label={`${rating} / 5`}>
      {"★".repeat(rating)}
      <span className="text-ink/20">{"★".repeat(Math.max(0, 5 - rating))}</span>
    </span>
  );
}

export default function MyQuestionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/giris");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getMyReviews()
      .then(setReviews)
      .catch(() => {
        setReviews([]);
        setError("Yorumların şu an yüklenemedi. Biraz sonra tekrar dene.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-2xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/hesabim" className="hover:text-burgundy">Hesabım</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Sorularım</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-2">Sorularım</h1>
      <p className="text-sm text-ink/55 mb-8">
        Ürün sayfalarında bıraktığın yorumlar burada, hangi ürüne yazdığınla birlikte görünür.
      </p>

      {loading ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : error ? (
        <p className="text-sm text-burgundy">{error}</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-xl px-6">
          <MessageCircle className="mx-auto mb-3 text-ink/30" size={32} />
          <p className="text-ink/50 text-sm mb-4">Henüz bir ürüne yorum yazmadın.</p>
          <Link
            href="/urunler"
            className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors"
          >
            Ürünlere Göz At
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const date = new Date(review.created_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <article key={review.id} className="bg-card rounded-xl p-5 flex flex-col gap-3">
                <Link href={`/urun/${review.product_slug}`} className="flex items-center gap-3 group">
                  <div className="relative w-14 h-14 shrink-0 bg-white overflow-hidden rounded-md">
                    {review.product_image ? (
                      <Image
                        src={review.product_image}
                        alt={review.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-ink/5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink group-hover:text-burgundy transition-colors truncate">
                      {review.product_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-ink/45">{date}</span>
                    </div>
                  </div>
                </Link>
                <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                {!review.visibility || review.visibility === "admin" ? (
                  <p className="text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded">
                    Bu yorum şu an yalnızca sende görünüyor. Yönetici yayına alınca herkes görür.
                  </p>
                ) : (
                  <p className="text-xs text-ink/45">Herkese açık</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
