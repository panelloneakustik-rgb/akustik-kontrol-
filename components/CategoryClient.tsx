"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, getProducts, type Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function CategoryClient({ slug }: { slug: string }) {
  const [title, setTitle] = useState(slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [categories, list] = await Promise.all([
        getCategories().catch(() => []),
        getProducts(slug).catch(() => []),
      ]);
      setTitle(categories.find((c) => c.slug === slug)?.name ?? slug);
      setProducts(list);
      setLoaded(true);
    })();
  }, [slug]);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{title}</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-8">{title}</h1>

      {!loaded ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : products.length === 0 ? (
        <p className="text-ink/50 text-sm">Bu kategoride henüz ürün bulunmuyor.</p>
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
