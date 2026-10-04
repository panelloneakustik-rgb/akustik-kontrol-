"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "ak_cookie_ok";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink/10 bg-cream/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink/80 leading-relaxed">
          Sepet ve giriş için zorunlu çerezler kullanırız. Ayrıntı{" "}
          <Link href="/cerez-politikasi" className="text-burgundy font-medium hover:underline">
            Çerez Politikası
          </Link>
          ’nda.
        </p>
        <button
          type="button"
          className="shrink-0 bg-burgundy px-5 py-2.5 text-sm font-medium text-white hover:bg-burgundy-dark"
          onClick={() => {
            try {
              localStorage.setItem(KEY, "1");
            } catch {
              /* ignore */
            }
            setVisible(false);
          }}
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
