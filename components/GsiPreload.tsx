"use client";

import { useEffect } from "react";

import { API_BASE } from "@/lib/config";

const GSI_SRC = "https://accounts.google.com/gsi/client";
export const GOOGLE_CLIENT_CACHE_KEY = "ak_google_client_id";

export function loadGsiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
  if (existing) {
    if (window.google?.accounts?.id) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google script")), { once: true });
      // Script already executed (cache) but google not on window yet — poll briefly.
      const start = Date.now();
      const tick = () => {
        if (window.google?.accounts?.id) resolve();
        else if (Date.now() - start > 8000) reject(new Error("Google script timeout"));
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script"));
    document.head.appendChild(script);
  });
}

export function cacheGoogleClientId(id: string) {
  try {
    sessionStorage.setItem(GOOGLE_CLIENT_CACHE_KEY, id);
    localStorage.setItem(GOOGLE_CLIENT_CACHE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function readCachedGoogleClientId(): string {
  try {
    return sessionStorage.getItem(GOOGLE_CLIENT_CACHE_KEY) || localStorage.getItem(GOOGLE_CLIENT_CACHE_KEY) || "";
  } catch {
    return "";
  }
}

/** Starts GIS + client id fetch on every page, so /giris is not the first request. */
export default function GsiPreload() {
  useEffect(() => {
    void loadGsiScript().catch(() => undefined);
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()) {
      cacheGoogleClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim());
      return;
    }
    if (readCachedGoogleClientId()) return;
    fetch(`${API_BASE}/auth/google/config/`)
      .then((res) => res.json())
      .then((data: { client_id?: string | null }) => {
        if (data.client_id) cacheGoogleClientId(data.client_id);
      })
      .catch(() => undefined);
  }, []);
  return null;
}
