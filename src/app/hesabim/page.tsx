"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, logout, cartCount, favorites } = useStore();
  const router = useRouter();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Hesabım</h1>
        <p className="mt-3 text-sm text-ink/60">
          Siparişlerinizi ve favorilerinizi görmek için giriş yapın.
        </p>
        <Link
          href="/giris"
          className="mt-6 inline-flex h-11 items-center bg-burgundy px-6 text-sm text-white hover:bg-burgundy-dark"
        >
          Giriş Yap
        </Link>
      </div>
    );
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
          Üyelik tarayıcınızda saklanır. Sipariş ve keşif için mağazayı arayabilir
          veya WhatsApp’tan yazabilirsiniz.
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
