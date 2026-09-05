"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Product } from "@/lib/api";
import { fetchFavorites, toggleFavorite, getSessionKey } from "@/lib/favorites";

type FavoritesContextValue = {
  productIds: Set<number>;
  products: Product[];
  loading: boolean;
  isFavorited: (productId: number) => boolean;
  toggle: (productId: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<Set<number>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const key = getSessionKey();
    if (!key) return;
    try {
      const data = await fetchFavorites(key);
      setProductIds(new Set(data.product_ids));
      setProducts(data.products);
    } catch {
      // Backend not reachable yet -- leave favorites empty rather than crash.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(async (productId: number) => {
    const key = getSessionKey();
    const result = await toggleFavorite(key, productId);
    setProductIds((prev) => {
      const next = new Set(prev);
      if (result.favorited) next.add(productId);
      else next.delete(productId);
      return next;
    });
    await refresh();
  }, [refresh]);

  const isFavorited = useCallback((productId: number) => productIds.has(productId), [productIds]);

  return (
    <FavoritesContext.Provider value={{ productIds, products, loading, isFavorited, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}