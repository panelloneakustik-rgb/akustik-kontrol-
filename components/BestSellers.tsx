import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function BestSellers({ products }: { products: Product[] }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <h2 className="text-center font-display text-2xl sm:text-3xl text-ink mb-8 sm:mb-10 pb-3 border-b border-ink/10 max-w-xs mx-auto">
        Çok Satanlar
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-ink/50 text-sm">
          Henüz ürün yok — backend&apos;de <code>python manage.py seed_demo</code> çalıştırıldığından emin olun.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 max-w-6xl mx-auto">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
