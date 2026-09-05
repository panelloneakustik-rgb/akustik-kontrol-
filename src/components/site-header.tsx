"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";
import { useStore } from "@/lib/store";
import { useState } from "react";

const nav = [
  { label: "ÜRÜNLER", href: "/urunler" },
  { label: "AKSESUAR", href: "/kategori/aksesuar" },
  { label: "MAĞAZALARIMIZ", href: "/magazalarimiz" },
  { label: "HAKKIMIZDA", href: "/hakkimizda" },
];

const iconBtn =
  "relative flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-burgundy";

export function SiteHeader() {
  const { cartCount, user } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
        <button
          type="button"
          aria-label="Menü"
          className={`${iconBtn} -ml-1 md:hidden`}
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
        {open ? (
          <div className="fixed inset-0 z-[80] md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Menüyü kapat"
              onClick={() => setOpen(false)}
            />
            <div className="relative h-full w-72 max-w-[80vw] bg-cream p-6 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-xl text-ink">Menü</p>
                <button
                  type="button"
                  aria-label="Kapat"
                  className={iconBtn}
                  onClick={() => setOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-4 text-sm font-medium tracking-wide">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="hover:text-burgundy"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        ) : null}

        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center justify-center md:flex-none md:justify-start"
        >
          <Image
            src="/logo.png"
            alt="Akustik Kontrol"
            width={500}
            height={73}
            className="h-8 w-auto max-w-[160px] object-contain sm:h-11 sm:max-w-[280px]"
            priority
          />
        </Link>

        <nav className="hidden gap-8 text-sm font-medium tracking-wide text-ink md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-burgundy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center text-ink">
          <SearchDialog className={iconBtn} />
          <Link href="/favoriler" aria-label="Favoriler" className={iconBtn}>
            <Heart size={20} />
          </Link>
          <Link
            href={user ? "/hesabim" : "/giris"}
            aria-label="Hesabım"
            className={iconBtn}
          >
            <User size={20} />
          </Link>
          <Link href="/sepet" aria-label="Sepetim" className={iconBtn}>
            <ShoppingBag size={20} />
            {cartCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
