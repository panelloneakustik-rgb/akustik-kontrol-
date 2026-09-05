"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { products, type Product } from "@/lib/catalog";

const CART_KEY = "ak_cart";
const FAV_KEY = "ak_favs";
const USER_KEY = "ak_user";
const EVENT = "ak-store";

export type CartItem = { slug: string; qty: number };
export type User = { name: string; email: string };

type StoreContextValue = {
  cart: CartItem[];
  favorites: string[];
  user: User | null;
  cartCount: number;
  cartProducts: { product: Product; qty: number }[];
  favoriteProducts: Product[];
  addToCart: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const emptyCart: CartItem[] = [];
const emptyFavs: string[] = [];

let cartSnap: CartItem[] = emptyCart;
let cartRaw: string | null | undefined;
let favSnap: string[] = emptyFavs;
let favRaw: string | null | undefined;
let userSnap: User | null = null;
let userRaw: string | null | undefined;

function snapshotJson<T>(
  key: string,
  fallback: T,
  cachedRaw: string | null | undefined,
  cachedValue: T
): { raw: string | null; value: T } {
  const raw = localStorage.getItem(key);
  if (raw === cachedRaw) return { raw, value: cachedValue };
  try {
    return { raw, value: raw ? (JSON.parse(raw) as T) : fallback };
  } catch {
    return { raw, value: fallback };
  }
}

function getCart() {
  if (typeof window === "undefined") return emptyCart;
  const next = snapshotJson(CART_KEY, emptyCart, cartRaw, cartSnap);
  cartRaw = next.raw;
  cartSnap = next.value;
  return cartSnap;
}

function getFavs() {
  if (typeof window === "undefined") return emptyFavs;
  const next = snapshotJson(FAV_KEY, emptyFavs, favRaw, favSnap);
  favRaw = next.raw;
  favSnap = next.value;
  return favSnap;
}

function getUser() {
  if (typeof window === "undefined") return null;
  const next = snapshotJson<User | null>(USER_KEY, null, userRaw, userSnap);
  userRaw = next.raw;
  userSnap = next.value;
  return userSnap;
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const cart = useSyncExternalStore(subscribe, getCart, () => emptyCart);
  const favorites = useSyncExternalStore(subscribe, getFavs, () => emptyFavs);
  const user = useSyncExternalStore(subscribe, getUser, () => null);

  const addToCart = useCallback((slug: string, qty = 1) => {
    const prev = getCart();
    const found = prev.find((i) => i.slug === slug);
    const next = found
      ? prev.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
      : [...prev, { slug, qty }];
    writeJson(CART_KEY, next);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    const prev = getCart();
    writeJson(
      CART_KEY,
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    writeJson(
      CART_KEY,
      getCart().filter((i) => i.slug !== slug)
    );
  }, []);

  const clearCart = useCallback(() => writeJson(CART_KEY, []), []);

  const toggleFavorite = useCallback((slug: string) => {
    const prev = getFavs();
    writeJson(
      FAV_KEY,
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const login = useCallback((email: string, name?: string) => {
    writeJson(USER_KEY, {
      email,
      name: name?.trim() || email.split("@")[0],
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const cartProducts = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((p) => p.slug === item.slug);
          return product ? { product, qty: item.qty } : null;
        })
        .filter((x): x is { product: Product; qty: number } => x !== null),
    [cart]
  );

  const favoriteProducts = useMemo(
    () => products.filter((p) => favorites.includes(p.slug)),
    [favorites]
  );

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const value = useMemo(
    () => ({
      cart,
      favorites,
      user,
      cartCount,
      cartProducts,
      favoriteProducts,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleFavorite,
      isFavorite,
      login,
      logout,
    }),
    [
      cart,
      favorites,
      user,
      cartCount,
      cartProducts,
      favoriteProducts,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleFavorite,
      isFavorite,
      login,
      logout,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
