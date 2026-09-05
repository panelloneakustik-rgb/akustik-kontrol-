import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { ProductGrid } from "@/components/product-grid";
import { categories, getBestsellers } from "@/lib/catalog";

export default function Home() {
  const bestsellers = getBestsellers();

  return (
    <>
      <HeroSlider />
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto mb-8 flex max-w-5xl flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="border border-ink/15 bg-white px-4 py-2 text-xs font-medium tracking-wide hover:border-burgundy hover:text-burgundy"
            >
              {c.name.toLocaleUpperCase("tr")}
            </Link>
          ))}
        </div>
        <h2 className="mx-auto mb-8 max-w-xs border-b border-ink/10 pb-3 text-center font-display text-2xl text-ink sm:mb-10 sm:text-3xl">
          Çok Satanlar
        </h2>
        <div className="mx-auto max-w-6xl">
          <ProductGrid
            products={bestsellers}
            empty="Gösterilecek çok satan ürün bulunamadı."
          />
        </div>
      </section>
    </>
  );
}
