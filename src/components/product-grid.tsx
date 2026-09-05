import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";

export function ProductGrid({
  products,
  empty,
}: {
  products: Product[];
  empty: string;
}) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-ink/50">{empty}</p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
