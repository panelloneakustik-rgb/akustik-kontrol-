"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Check, Heart } from "lucide-react";
import type { Product } from "@/lib/api";
import { formatTL } from "@/lib/api";
import { useCart } from "@/components/CartProvider";
import { useFavorites } from "@/components/FavoritesProvider";

const CYCLE_MS = 900;

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discount_percent > 0;
  const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addItem } = useCart();
  const { isFavorited, toggle } = useFavorites();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const favorited = isFavorited(product.id);

  const startCycle = () => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, CYCLE_MS);
  };

  const stopCycle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIndex(0);
  };

  useEffect(() => () => stopCycle(), []);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      setAdded(false);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle(product.id);
    } catch {
      // Silently ignore -- backend may be unreachable during local dev.
    }
  };

  return (
    <div
      className="bg-card rounded-sm overflow-hidden flex flex-col"
      onMouseEnter={startCycle}
      onMouseLeave={stopCycle}
    >
      <Link href={`/urun?slug=${encodeURIComponent(product.slug)}`} className="block">
        <div className="relative aspect-square bg-white">
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
            {hasDiscount && (
              <span className="bg-burgundy text-white text-xs font-semibold px-2 py-1">
                % {product.discount_percent} İndirim
              </span>
            )}
          </div>
          {product.is_new && (
            <span className="absolute top-3 right-3 z-10 bg-gray-200 text-ink text-xs font-medium px-2 py-1">
              Yeni Ürün
            </span>
          )}

          <button
            onClick={handleToggleFavorite}
            aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
            className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart
              size={16}
              className={favorited ? "text-burgundy" : "text-ink/40"}
              fill={favorited ? "currentColor" : "none"}
            />
          </button>

          {images.length > 0 ? (
            <Image
              src={images[index]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover transition-opacity duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
              görsel yok
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-burgundy" : "bg-white/70"}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 px-4 flex flex-col gap-2 text-center">
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-ink uppercase leading-snug">{product.name}</h3>

          <div className="flex flex-col items-center">
            {hasDiscount && (
              <span className="text-xs text-ink/40 line-through">{formatTL(product.price)}</span>
            )}
            <span className="text-lg font-bold text-ink">{formatTL(product.discounted_price)}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock <= 0}
          className="w-full flex items-center justify-center gap-2 bg-burgundy hover:bg-burgundy-dark disabled:opacity-60 text-white text-xs sm:text-sm font-medium py-3 min-h-11 transition-colors"
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          {product.stock <= 0 ? "Stokta yok" : added ? "Eklendi" : "Sepete Ekle"}
        </button>
      </div>
    </div>
  );
}