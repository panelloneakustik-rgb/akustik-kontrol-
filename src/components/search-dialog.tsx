"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatTL, searchProducts } from "@/lib/catalog";

export function SearchDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = useMemo(() => searchProducts(q), [q]);

  return (
    <>
      <button
        type="button"
        aria-label="Ara"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Search size={20} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/40 p-4 pt-20 sm:pt-28">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg border border-ink/10 bg-cream p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Ürün ara</h2>
              <button
                type="button"
                aria-label="Kapat"
                className="flex h-9 w-9 items-center justify-center hover:text-burgundy"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Sünger, panel, bariyer…"
              className="h-11 w-full border border-ink/20 bg-white px-3 text-sm outline-none focus:border-burgundy"
            />
            <div className="mt-3 max-h-80 overflow-y-auto">
              {!q.trim() ? (
                <p className="py-6 text-center text-sm text-ink/50">
                  Ürün adı veya malzeme yazın.
                </p>
              ) : results.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink/50">
                  “{q}” için ürün bulunamadı.
                </p>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {results.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/urun/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 py-3 hover:bg-white/60"
                      >
                        <Image
                          src={p.image}
                          alt=""
                          width={56}
                          height={56}
                          className="h-14 w-14 object-cover"
                        />
                        <span className="flex-1 text-sm text-ink">{p.name}</span>
                        <span className="text-sm font-semibold">
                          {formatTL(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
