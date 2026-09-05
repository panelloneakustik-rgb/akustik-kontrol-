"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { ProductGrid } from "@/components/product-grid";
import { Badge } from "@/components/ui/badge";
import {
  discountedPrice,
  formatTL,
  getProduct,
  relatedProducts,
} from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [active, setActive] = useState(0);

  const related = useMemo(
    () => (product ? relatedProducts(product) : []),
    [product]
  );

  if (!product) {
    return (
      <div className="px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Ürün bulunamadı</h1>
        <Link href="/urunler" className="mt-6 inline-block text-burgundy underline">
          Tüm ürünler
        </Link>
      </div>
    );
  }

  const price = discountedPrice(product);
  const fav = isFavorite(product.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { href: "/urunler", label: "Ürünler" },
          { label: product.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden bg-white">
            <Image
              src={product.images[active] ?? product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {product.images.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative h-16 w-16 overflow-hidden border ${
                    i === active ? "border-burgundy" : "border-ink/10"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <div className="mb-3 flex gap-2">
            {product.isNew ? (
              <Badge className="rounded-none bg-burgundy text-white">Yeni</Badge>
            ) : null}
            {product.isBestseller ? (
              <Badge className="rounded-none bg-ink text-white">Çok Satan</Badge>
            ) : null}
          </div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-bold">
            {product.discountPercent > 0 ? (
              <>
                <span className="mr-2 text-base font-normal text-ink/40 line-through">
                  {formatTL(product.price)}
                </span>
                {formatTL(price)}
              </>
            ) : (
              formatTL(price)
            )}
          </p>
          <p className="mt-4 leading-relaxed text-ink/70">{product.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink/50">Ölçü</dt>
              <dd>{product.dimensions}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Renk</dt>
              <dd>{product.color}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ink/50">Malzeme</dt>
              <dd>{product.material}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Stok</dt>
              <dd>{product.stock} adet</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center border border-ink/15 bg-white">
              <button
                type="button"
                aria-label="Azalt"
                className="px-3"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                type="button"
                aria-label="Artır"
                className="px-3"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart(product.slug, qty);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1400);
              }}
              className="flex h-11 flex-1 items-center justify-center gap-2 bg-burgundy px-6 text-sm text-white hover:bg-burgundy-dark disabled:opacity-60 sm:flex-none"
            >
              {added ? (
                <>
                  <Check size={16} /> Eklendi
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Sepete Ekle
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.slug)}
              className="flex h-11 items-center gap-2 border border-ink/20 px-4 text-sm hover:border-burgundy"
            >
              <Heart
                size={16}
                className={fav ? "fill-burgundy text-burgundy" : ""}
              />
              {fav ? "Favoride" : "Favorile"}
            </button>
          </div>
          <p className="mt-6 text-sm text-ink/60">
            Keşif ve uygulama için 0 216 630 21 41 numaralı hattı arayın. İstanbul
            içi montaj için mağazamızla görüşün.
          </p>
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-8 font-display text-2xl">Benzer Ürünler</h2>
          <ProductGrid products={related} empty="" />
        </section>
      ) : null}
    </div>
  );
}
