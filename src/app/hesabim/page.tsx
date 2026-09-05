"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, logout, ready, cartCount, favorites } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/giris");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <p className="px-4 py-16 text-center text-sm text-ink/50">Yükleniyor…</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 font-display text-3xl">Hesabım</h1>
      <p className="text-ink/70">
        Merhaba, <strong>{user.name}</strong>
      </p>
      <p className="text-sm text-ink/50">{user.email}</p>
      <div className="mt-8 space-y-3 border border-ink/10 bg-white p-6 text-sm">
        <p>Sepette {cartCount} ürün</p>
        <p>Favorilerde {favorites.length} ürün</p>
        <p className="text-ink/50">
          Üyelik bu sürüde tarayıcınızda saklanır. Sipariş ve keşif için mağazayı
          arayabilir veya WhatsApp’tan yazabilirsiniz.
        </p>
      </div>
      <div className="mt-6 flex gap-3">
        <Link
          href="/sepet"
          className="inline-flex h-11 items-center border border-ink/15 px-4 text-sm hover:border-burgundy"
        >
          Sepete git
        </Link>
        <Button
          variant="outline"
          className="h-11 rounded-none"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Çıkış yap
        </Button>
      </div>
    </div>
  );
}
