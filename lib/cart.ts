import { getAccessToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000/api";
const SESSION_KEY_STORAGE = "ndesign_cart_session";

export type CartItem = {
  id: number;
  product: number;
  product_name: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
  subtotal: string;
  variant_note: string;
  stock: number;
};

export type Cart = {
  id: number;
  session_key: string;
  items: CartItem[];
  total: string;
};

export function getSessionKey(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem(SESSION_KEY_STORAGE);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY_STORAGE, key);
  }
  return key;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Cart API ${path} failed: ${res.status}`);
  }
  return res.json();
}

export function fetchCart(sessionKey: string) {
  return request<Cart>(`/cart/${sessionKey}/`);
}

export function addToCart(sessionKey: string, productId: number, quantity = 1, variantNote = "") {
  return request<Cart>(`/cart/${sessionKey}/add/`, {
    method: "POST",
    body: JSON.stringify({ product: productId, quantity, variant_note: variantNote }),
  });
}

export function updateCartItem(sessionKey: string, itemId: number, quantity: number) {
  return request<Cart>(`/cart/${sessionKey}/items/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(sessionKey: string, itemId: number) {
  return request<Cart>(`/cart/${sessionKey}/items/${itemId}/`, { method: "DELETE" });
}

export type CheckoutInfo = {
  address_title: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile_phone: string;
  tc_kimlik_no: string;
  country: string;
  city: string;
  district: string;
  address: string;
  invoice_type: "individual" | "company";
  company_name: string;
  tax_office: string;
  tax_number: string;
};

export function checkoutCart(sessionKey: string, info: CheckoutInfo) {
  return request(`/cart/${sessionKey}/checkout/`, {
    method: "POST",
    body: JSON.stringify(info),
  });
}