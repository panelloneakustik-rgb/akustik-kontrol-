"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Heart, User, ShoppingBag, X, Menu } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useFavorites } from "@/components/FavoritesProvider";

const NAV = [
  { label: "ÜRÜNLER", href: "/urunler" },
  { label: "AKSESUAR", href: "/kategori/aksesuar" },
  { label: "MAĞAZALARIMIZ", href: "/magazalarimiz" },
  { label: "HAKKIMIZDA", href: "/hakkimizda" },
];

const iconBtn = "relative flex h-11 w-11 items-center justify-center hover:text-burgundy transition-colors";

export default function Header() {
  const { user } = useAuth();
  const { productIds } = useFavorites();
  const { itemCount } = useCart();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-ink/10">
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <button
          type="button"
          aria-label={menuOpen ? "Menüyü kapat" : "Menü"}
          className={`${iconBtn} md:hidden -ml-1`}
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="flex min-w-0 flex-1 items-center justify-center md:flex-none md:justify-start">
          <Image
            src="/logo.png"
            alt="Akustik Kontrol"
            width={500}
            height={73}
            className="h-8 w-auto max-w-[160px] object-contain sm:h-11 sm:max-w-[280px]"
          />
        </Link>

        <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-ink">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-burgundy transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center text-ink">
          <div className="relative hidden md:flex items-center">
            {searchOpen && (
              <form onSubmit={handleSearchSubmit} className="absolute right-11 top-1/2 -translate-y-1/2">
                <input
                  autoFocus
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-64 border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-burgundy"
                />
              </form>
            )}
            <button
              type="button"
              aria-label={searchOpen ? "Aramayı kapat" : "Ara"}
              onClick={() => setSearchOpen((v) => !v)}
              className={iconBtn}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

          <button
            type="button"
            aria-label="Ara"
            className={`${iconBtn} md:hidden`}
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            <Search size={20} />
          </button>

          <Link href="/favoriler" aria-label="Favoriler" className={iconBtn}>
            <Heart size={20} />
            {mounted && productIds.size > 0 && (
              <span className="absolute top-1 right-1 bg-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {productIds.size}
              </span>
            )}
          </Link>

          <Link href={mounted && user ? "/hesabim" : "/giris"} aria-label="Hesabım" className={iconBtn}>
            <User size={20} />
          </Link>

          <Link href="/sepet" aria-label="Sepetim" className={iconBtn}>
            <ShoppingBag size={20} />
            {mounted && itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearchSubmit} className="md:hidden border-t border-ink/10 px-4 py-3">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full border border-ink/20 bg-white px-3 py-3 text-base text-ink focus:outline-none focus:border-burgundy"
          />
        </form>
      )}

      {menuOpen && (
        <nav className="md:hidden border-t border-ink/10 px-4 py-2 flex flex-col bg-cream">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm font-medium tracking-wide text-ink border-b border-ink/10 last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
