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
  addItem: (productId: number, quantity?: number, variantNote?: string, variantId?: number | null) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const key = getSessionKey();
    if (!key) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const data = await fetchCart(key, ctrl.signal);
      setCart(data);
    } catch {
      /* keep current cart */
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId: number, quantity = 1, variantNote = "", variantId?: number | null) => {
    const key = getSessionKey();
    const data = await apiAddToCart(key, productId, quantity, variantNote, variantId);
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