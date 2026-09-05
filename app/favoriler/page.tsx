"use client";

import Link from "next/link";
import { useFavorites } from "@/components/FavoritesProvider";
import ProductCard from "@/components/ProductCard";

export default function FavoritesPage() {
  const { products, loading } = useFavorites();

  if (loading) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  if (products.length === 0) {
    return (
      <main className="px-4 sm:px-6 lg:px-8 py-24 max-w-lg mx-auto text-center">
        <h1 className="font-display text-3xl text-ink mb-3">Favori listeniz boş</h1>
        <p className="text-ink/60 mb-6">
          Beğendiğin ürünlerdeki kalp ikonuna tıklayarak buraya ekleyebilirsin.
        </p>
        <Link href="/" className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors">
          Alışverişe Başla
        </Link>
      </main>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8">Favorilerim</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}