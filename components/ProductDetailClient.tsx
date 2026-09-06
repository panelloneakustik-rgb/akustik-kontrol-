"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Truck, Lock, ShieldCheck } from "lucide-react";
import { getProductBySlug, formatTL } from "@/lib/api";
import ProductGallery from "@/components/ProductGallery";
import AddToCartBox from "@/components/AddToCartBox";
import RelatedProducts from "@/components/RelatedProducts";
import ProductReviews from "@/components/ProductReviews";

type Detail = Awaited<ReturnType<typeof getProductBySlug>>;

export default function ProductDetailClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("slug")?.trim() || "";
  const fromPath = pathname.replace(/^\/urun\/?/, "").replace(/\/$/, "");
  const slug = fromQuery || (fromPath && fromPath !== "placeholder" ? fromPath : "");
  const [product, setProduct] = useState<Detail | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    if (!slug || slug === "placeholder") {
      setStatus("missing");
      return;
    }
    setStatus("loading");
    getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        setStatus("ok");
      })
      .catch(() => setStatus("missing"));
  }, [slug]);

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

  const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const hasDiscount = product.discount_percent > 0;
  const specs = [
    { label: "Yoğunluk", value: product.density },
    { label: "Ebat", value: product.dimensions },
    { label: "Kalınlık", value: product.thickness },
    { label: "Malzeme", value: product.material },
    { label: "Renk", value: product.color },
  ].filter((s) => s.value);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
      <nav className="text-xs text-ink/50 mb-6 break-words">
        <Link href="/" className="hover:text-burgundy">Ana Sayfa</Link>
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
              <span className="text-base text-ink/40 line-through">{formatTL(product.price)}</span>
            )}
            <span className="text-2xl font-bold text-ink">{formatTL(product.discounted_price)}</span>
            {hasDiscount && (
              <span className="bg-burgundy text-white text-xs font-semibold px-2 py-1">
                % {product.discount_percent} İndirim
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
            {product.stock > 0 ? `Stokta ${product.stock} adet` : "Stokta yok"}
          </p>

          <AddToCartBox productId={product.id} maxQty={product.stock || 0} colorSwatches={product.color_swatches} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-ink/10 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck size={20} className="text-burgundy" />
              <span className="text-xs text-ink/60">
                {product.shipping_days || "2-4"} iş günü içinde kargoda
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock size={20} className="text-burgundy" />
              <span className="text-xs text-ink/60">3D Secure ile güvenli ödeme</span>
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
