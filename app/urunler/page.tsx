"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, getProducts, type Category, type Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function AllProductsPage() {
  const [sections, setSections] = useState<{ category: Category; products: Product[] }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const categories = await getCategories().catch(() => []);
      const next = await Promise.all(
        categories.map(async (cat) => ({
          category: cat,
          products: await getProducts(cat.slug).catch(() => []),
        })),
      );
      setSections(next.filter((s) => s.products.length > 0));
      setLoaded(true);
    })();
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Ürünler</span>
      </nav>

      <h1 className="font-display text-3xl text-ink mb-10">Tüm Ürünler</h1>

      {!loaded ? (
        <p className="text-ink/50 text-sm">Yükleniyor...</p>
      ) : sections.length === 0 ? (
        <p className="text-ink/50 text-sm">Henüz ürün bulunmuyor.</p>
      ) : (
        sections.map(({ category, products }) => (
          <section key={category.id} className="mb-16">
            <div className="flex items-baseline justify-between mb-6 border-b border-ink/10 pb-3">
              <h2 className="font-display text-2xl text-ink">{category.name}</h2>
              <Link
                href={`/kategori/${category.slug}`}
                className="text-xs text-burgundy hover:underline"
              >
                Tümünü Gör
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {products.slice(0, 3).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
