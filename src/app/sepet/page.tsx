"use client";

import { Button } from "@/components/ui/button";
import { discountedPrice, formatTL, storeInfo } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const { cartProducts, setQty, removeFromCart, clearCart, ready } = useStore();
  const [ordered, setOrdered] = useState(false);

  const total = cartProducts.reduce(
    (sum, { product, qty }) => sum + discountedPrice(product) * qty,
    0
  );

  if (!ready) {
    return <p className="px-4 py-16 text-center text-sm text-ink/50">Yükleniyor…</p>;
  }

  if (ordered) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Siparişiniz alındı</h1>
        <p className="mt-4 text-ink/70">
          Bu önizlemede ödeme bağlantısı kapalı. Talebiniz kaydedildi; gerçek
          sipariş için mağazayı arayın veya WhatsApp’tan yazın.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={storeInfo.phoneHref}
            className="inline-flex h-11 items-center bg-burgundy px-6 text-sm text-white hover:bg-burgundy-dark"
          >
            {storeInfo.phoneDisplay}
          </a>
          <Link href="/urunler" className="text-sm underline hover:text-burgundy">
            Alışverişe dön
          </Link>
        </div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Sepetiniz boş</h1>
        <p className="mt-3 text-sm text-ink/60">
          Akustik sünger, panel ve aksesuarları katalogdan ekleyebilirsiniz.
        </p>
        <Link
          href="/urunler"
          className="mt-8 inline-flex h-11 items-center bg-burgundy px-6 text-sm text-white hover:bg-burgundy-dark"
        >
          Ürünlere git
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl">Sepetim</h1>
      <ul className="divide-y divide-ink/10 border border-ink/10 bg-white">
        {cartProducts.map(({ product, qty }) => (
          <li key={product.slug} className="flex gap-4 p-4">
            <Image
              src={product.image}
              alt=""
              width={88}
              height={88}
              className="h-20 w-20 object-cover"
            />
            <div className="min-w-0 flex-1">
              <Link href={`/urun/${product.slug}`} className="font-medium hover:text-burgundy">
                {product.name}
              </Link>
              <p className="text-sm text-ink/60">{formatTL(discountedPrice(product))}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-9 items-center border border-ink/15">
                  <button
                    type="button"
                    className="px-2"
                    onClick={() => setQty(product.slug, qty - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-7 text-center text-sm">{qty}</span>
                  <button
                    type="button"
                    className="px-2"
                    onClick={() => setQty(product.slug, qty + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(product.slug)}
                  className="text-ink/50 hover:text-burgundy"
                  aria-label="Kaldır"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold">
              {formatTL(discountedPrice(product) * qty)}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col items-end gap-4">
        <p className="text-lg font-bold">Toplam: {formatTL(total)}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-none"
            onClick={clearCart}
          >
            Sepeti temizle
          </Button>
          <Button
            className="h-11 rounded-none bg-burgundy text-white hover:bg-burgundy-dark"
            onClick={() => {
              clearCart();
              setOrdered(true);
            }}
          >
            Siparişi tamamla
          </Button>
        </div>
      </div>
    </div>
  );
}
