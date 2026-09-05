"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  addToCart as apiAddToCart,
  fetchCart,
  getSessionKey,
  removeCartItem,
  updateCartItem,
  type Cart,
} from "@/lib/cart";

type CartContextValue = {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addItem: (productId: number, quantity?: number, variantNote?: string) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const key = getSessionKey();
    if (!key) return;
    try {
      const data = await fetchCart(key);
      setCart(data);
    } catch {
      // Backend not reachable yet -- leave cart empty rather than crash the page.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId: number, quantity = 1, variantNote = "") => {
  const key = getSessionKey();
  const data = await apiAddToCart(key, productId, quantity, variantNote);
  setCart(data);
}, []);

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const key = getSessionKey();
    const data = await updateCartItem(key, itemId, quantity);
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const key = getSessionKey();
    const data = await removeCartItem(key, itemId);
    setCart(data);
  }, []);

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}