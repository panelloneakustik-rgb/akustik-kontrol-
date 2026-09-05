import { Breadcrumb } from "@/components/breadcrumb";
import { ProductGrid } from "@/components/product-grid";
import { categories, products } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Tüm Ürünler" };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "Ürünler" }]} />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-3xl text-ink">Tüm Ürünler</h1>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="text-xs tracking-wide text-ink/60 hover:text-burgundy"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <ProductGrid products={products} empty="Henüz ürün yok." />
    </div>
  );
}
