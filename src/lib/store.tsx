"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products, type Product } from "@/lib/catalog";

const CART_KEY = "ak_cart";
const FAV_KEY = "ak_favs";
const USER_KEY = "ak_user";

export type CartItem = { slug: string; qty: number };
export type User = { name: string; email: string };

type StoreContextValue = {
  ready: boolean;
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

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    /* Hydrate from localStorage after mount (SSR-safe). */
    /* eslint-disable react-hooks/set-state-in-effect */
    setCart(readJson<CartItem[]>(CART_KEY, []));
    setFavorites(readJson<string[]>(FAV_KEY, []));
    setUser(readJson<User | null>(USER_KEY, null));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites, ready]);

  useEffect(() => {
    if (!ready) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user, ready]);

  const addToCart = useCallback((slug: string, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((i) => i.slug === slug);
      if (found) {
        return prev.map((i) =>
          i.slug === slug ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { slug, qty }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const login = useCallback((email: string, name?: string) => {
    setUser({
      email,
      name: name?.trim() || email.split("@")[0],
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

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
      ready,
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
      ready,
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
