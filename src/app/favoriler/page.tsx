"use client";

import { ProductGrid } from "@/components/product-grid";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function FavoritesPage() {
  const { favoriteProducts, ready } = useStore();

  if (!ready) {
    return <p className="px-4 py-16 text-center text-sm text-ink/50">Yükleniyor…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl">Favoriler</h1>
      {favoriteProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-ink/60">
            Henüz favori ürün yok. Kalp ikonuna basarak kaydedin.
          </p>
          <Link
            href="/urunler"
            className="mt-6 inline-flex h-11 items-center bg-burgundy px-6 text-sm text-white hover:bg-burgundy-dark"
          >
            Ürünleri incele
          </Link>
        </div>
      ) : (
        <ProductGrid products={favoriteProducts} empty="" />
      )}
    </div>
  );
}
