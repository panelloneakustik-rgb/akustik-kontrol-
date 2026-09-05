"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchProducts, type Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    setLoading(true);
    searchProducts(query)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Arama</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-2">Arama Sonuçları</h1>
      {query.trim() && (
        <p className="text-sm text-ink/60 mb-8">
          &ldquo;{query}&rdquo; için {loading ? "..." : products.length} sonuç bulundu.
        </p>
      )}

      {!query.trim() ? (
        <p className="text-ink/50 text-sm">Aramak istediğiniz ürünü yukarıdaki arama kutusuna yazın.</p>
      ) : loading ? (
        <p className="text-ink/50 text-sm">Aranıyor...</p>
      ) : products.length === 0 ? (
        <p className="text-ink/50 text-sm">Aramanızla eşleşen ürün bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>}>
      <SearchResults />
    </Suspense>
  );
}
