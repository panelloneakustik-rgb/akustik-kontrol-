"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { discountedPrice, formatTL, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const [added, setAdded] = useState(false);
  const fav = isFavorite(product.slug);
  const price = discountedPrice(product);
  const hasDiscount = product.discountPercent > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-ink/10 bg-white">
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Link href={`/urun/${product.slug}`} className="block h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew ? (
            <Badge className="rounded-none bg-burgundy text-white">Yeni</Badge>
          ) : null}
          {hasDiscount ? (
            <Badge className="rounded-none bg-ink text-white">
              %{product.discountPercent}
            </Badge>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
          onClick={() => toggleFavorite(product.slug)}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center bg-white/90 text-ink hover:text-burgundy"
        >
          <Heart
            size={18}
            className={cn(fav && "fill-burgundy text-burgundy")}
          />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/urun/${product.slug}`} className="flex-1">
          <h3 className="font-medium leading-snug text-ink hover:text-burgundy">
            {product.name}
          </h3>
          <p className="mt-2 text-lg font-bold text-ink">
            {hasDiscount ? (
              <>
                <span className="mr-2 text-sm font-normal text-ink/40 line-through">
                  {formatTL(product.price)}
                </span>
                {formatTL(price)}
              </>
            ) : (
              formatTL(price)
            )}
          </p>
        </Link>
        <Button
          type="button"
          disabled={product.stock <= 0 || added}
          onClick={() => {
            addToCart(product.slug);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
          className="mt-3 h-11 w-full rounded-none bg-burgundy text-white hover:bg-burgundy-dark"
        >
          {product.stock <= 0 ? (
            "Stokta yok"
          ) : added ? (
            <>
              <Check size={16} /> Eklendi
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> Sepete Ekle
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
