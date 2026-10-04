"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Lock, ShieldCheck } from "lucide-react";
import { getProductBySlug, formatTL, type ProductVariant } from "@/lib/api";
import ProductGallery from "@/components/ProductGallery";
import AddToCartBox from "@/components/AddToCartBox";
import FreeShippingBanner from "@/components/FreeShippingBanner";
import RelatedProducts from "@/components/RelatedProducts";
import ProductReviews from "@/components/ProductReviews";
import { customerStockLabel } from "@/lib/stock";

type Detail = Awaited<ReturnType<typeof getProductBySlug>>;

export default function ProductDetailClient({
  slug,
  initial = null,
}: {
  slug: string;
  initial?: Detail | null;
}) {
  const invalid = !slug || slug === "placeholder" || slug === "_none";
  const [product, setProduct] = useState<Detail | null>(initial);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">(
    initial ? "ok" : invalid ? "missing" : "loading"
  );
  const [variantId, setVariantId] = useState<number | null>(null);

  useEffect(() => {
    if (invalid) {
      setStatus("missing");
      return;
    }
    if (initial && initial.slug === slug) {
      setProduct(initial);
      setStatus("ok");
      return;
    }
    setStatus("loading");
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        setStatus("ok");
      })
      .catch(() => setStatus("missing"));
  }, [slug, initial, invalid]);

  useEffect(() => {
    const list = product?.variants ?? [];
    if (!list.length) {
      setVariantId(null);
      return;
    }
    setVariantId((current) => {
      if (current && list.some((v) => v.id === current)) return current;
      return (list.find((v) => v.stock > 0) ?? list[0]).id;
    });
  }, [product]);

  if (status === "loading") {
    return (
      <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>
    );
  }

  if (status === "missing" || !product) {
    return (
      <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-lg mx-auto text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Ürün bulunamadı</h1>
        <p className="text-sm text-ink/60 mb-6">Bu ürün kaldırılmış veya henüz yayınlanmamış olabilir.</p>
        <Link href="/urunler" className="text-burgundy text-sm font-medium hover:underline">
          Tüm ürünler
        </Link>
      </main>
    );
  }

  const variants: ProductVariant[] = product.variants ?? [];
  const selected = variants.find((v) => v.id === variantId) ?? variants[0] ?? null;

  const categorySlug =
    typeof product.category === "string" ? product.category : product.category?.slug;
  const categoryName =
    typeof product.category === "string" ? product.category : product.category?.name;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const hasDiscount = (selected?.discount_percent ?? product.discount_percent) > 0;
  const displayPrice = selected?.price ?? product.price;
  const displayDiscounted = selected?.discounted_price ?? product.discounted_price;
  const displayDiscount = selected?.discount_percent ?? product.discount_percent;
  const displayStock = selected?.stock ?? product.stock;
  const specs = [
    { label: "Model", value: product.product_model },
    { label: "Kalınlık", value: selected?.thickness || product.thickness },
    { label: "Ebat", value: selected?.dimensions || product.dimensions },
    { label: "Yoğunluk", value: selected?.density || product.density },
    { label: "Yapı", value: product.material },
    { label: "Üretim", value: product.production },
  ].filter((s) => s.value);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6 break-words">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
        <span className="mx-2">/</span>
        <Link href="/urunler" className="hover:text-burgundy">Ürünler</Link>
        {categorySlug && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/kategori/${categorySlug}`} className="hover:text-burgundy">
              {categoryName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery images={images} alt={product.name} />

        <div className="flex flex-col gap-4">
          {product.is_new && (
            <span className="self-start bg-gray-200 text-ink text-xs font-medium px-2 py-1">Yeni Ürün</span>
          )}
          <h1 className="font-display text-3xl text-ink">{product.name}</h1>

          <div className="flex items-baseline gap-3 flex-wrap">
            {hasDiscount && (
              <span className="text-base text-ink/40 line-through">{formatTL(displayPrice)}</span>
            )}
            <span className="text-2xl font-bold text-ink">{formatTL(displayDiscounted)}</span>
            {hasDiscount && (
              <span className="bg-burgundy text-white text-xs font-semibold px-2 py-1">
                % {displayDiscount} İndirim
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-ink/70 leading-relaxed">{product.description}</p>
          )}

          {specs.length > 0 && (
            <table className="text-sm w-full max-w-sm mt-2">
              <tbody>
                {specs.map((s) => (
                  <tr key={s.label} className="border-b border-ink/10">
                    <td className="py-2 text-ink/50 w-28">{s.label}</td>
                    <td className="py-2 text-ink font-medium">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="text-xs text-ink/50">
            {customerStockLabel(displayStock)}
          </p>

          <AddToCartBox
            productId={product.id}
            maxQty={displayStock || 0}
            colorSwatches={product.color_swatches}
            variants={variants}
            selectedVariantId={variantId}
            onVariantChange={setVariantId}
          />

          <FreeShippingBanner />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 pt-6 border-t border-ink/10 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck size={20} className="text-burgundy" />
              <span className="text-xs text-ink/60">
                {product.shipping_days || "2-4"} iş günü içinde kargoda
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock size={20} className="text-burgundy" />
              <span className="text-xs text-ink/60">Güvenli ödeme</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={20} className="text-burgundy" />
              <span className="text-xs text-ink/60">2 yıl garanti</span>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews slug={product.slug} />
      <RelatedProducts products={product.related_products} />
    </main>
  );
}
