"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getMyReturnRequests, type ReturnRequest } from "@/lib/orders";
import { formatTL } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

export default function ReturnRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/giris");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getMyReturnRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
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
        <span className="text-ink">İade ve İptal Taleplerim</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">İade ve İptal Taleplerim</h1>

      {loading ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-ink/50 text-sm mb-4">
            Henüz bir iade veya iptal talebin yok. Siparişlerim sayfasından bir sipariş için talep oluşturabilirsin.
          </p>
          <Link href="/hesabim/siparisler" className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors">
            Siparişlerime Git
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <div key={r.id} className="bg-card p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {r.request_type_display} — Sipariş #{r.order_id}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-200 text-ink"}`}>
                    {r.status_display}
                  </span>
                </div>
                <p className="text-xs text-ink/50">{date} · {formatTL(r.order_total)}</p>
                <p className="text-sm text-ink/70">{r.reason}</p>
                {r.admin_note && (
                  <div className="mt-1 text-xs bg-white p-3 border-l-2 border-burgundy">
                    <span className="font-semibold text-ink/70">Mağaza notu: </span>
                    <span className="text-ink/60">{r.admin_note}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}