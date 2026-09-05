import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function RelatedProducts({ products = [] }: { products?: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <h2 className="font-display text-2xl text-ink mb-6">Benzer Ürünler</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}