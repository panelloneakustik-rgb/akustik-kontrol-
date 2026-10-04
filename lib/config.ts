export const REMOTE_API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "https://api.akustikkontrol.com.tr/api"
).replace(/\/$/, "");

/** Resolve at call time — a module-level `typeof window` can freeze the server URL in the client bundle. */
export function getApiBase(): string {
  if (typeof window === "undefined") return REMOTE_API_BASE;
  return "/shop-api";
}

/** Browser calls same-origin `/shop-api` (rewritten to the Django API) so CORS cannot block cart or product. */
export const API_BASE = getApiBase();

export const WHATSAPP_E164 = "902166302141";
export const STORE_PHONE_DISPLAY = "0 216 630 21 41";

export function whatsappHref(text: string) {
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
