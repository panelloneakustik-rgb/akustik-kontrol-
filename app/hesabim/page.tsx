"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User as UserIcon, ShoppingBag, Heart, Package, MapPin, MessageCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useFavorites } from "@/components/FavoritesProvider";
import { getMyOrders } from "@/lib/orders";
import { getMyReviews } from "@/lib/reviews";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { productIds } = useFavorites();
  const router = useRouter();
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/giris");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getMyOrders().then((o) => setOrderCount(o.length)).catch(() => setOrderCount(null));
    getMyReviews().then((r) => setReviewCount(r.length)).catch(() => setReviewCount(null));
  }, [user]);

  if (loading || !user) {
    return <main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>;
  }

  const initials =
    (user.full_name || user.email)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || user.email[0]?.toUpperCase();

  const NAV_CARDS = [
    { label: "Sepetim", href: "/sepet", icon: ShoppingBag, count: itemCount, highlight: true },
    { label: "Favorilerim", href: "/favoriler", icon: Heart, count: productIds.size, highlight: false },
    { label: "Siparişlerim", href: "/hesabim/siparisler", icon: Package, count: orderCount, highlight: false },
    { label: "Sorularım", href: "/hesabim/sorularim", icon: MessageCircle, count: reviewCount, highlight: false },
    { label: "Adreslerim", href: "/hesabim/adreslerim", icon: MapPin, count: null, highlight: false },
    { label: "Kullanıcı Bilgilerim", href: "/hesabim/bilgilerim", icon: UserIcon, count: null, highlight: false },
  ];

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl text-ink mb-8 text-center">Hesabım</h1>

      <div className="relative overflow-hidden bg-gradient-to-br from-burgundy to-burgundy-dark p-6 mb-10 rounded-xl shadow-md">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4 min-w-0">
          <div className="w-20 h-20 bg-white/15 backdrop-blur text-white flex items-center justify-center font-display text-2xl shrink-0 rounded-full border border-white/20">
            {initials}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white font-medium break-words">{user.full_name || "Üye"}</span>
            <span className="text-white/80 text-sm break-all">{user.email}</span>
            <span className="self-start text-xs font-medium text-gold bg-white/10 border border-gold/50 rounded-full px-3 py-1">
              ÜYE
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {NAV_CARDS.map(({ label, href, icon: Icon, count, highlight }) => (
          <Link
            key={href}
            href={href}
            className={`group relative flex flex-col items-center gap-3 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-center min-h-[7.5rem] ${
              highlight
                ? "bg-burgundy text-white hover:bg-burgundy-dark"
                : "bg-card text-ink hover:bg-white"
            }`}
          >
            {count !== null && count !== undefined && count > 0 && (
              <span
                className={`absolute top-2 right-2 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                  highlight ? "bg-white text-burgundy" : "bg-gold text-white"
                }`}
              >
                {count}
              </span>
            )}
            <Icon size={26} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="w-full flex items-center justify-center gap-2 border border-ink/20 rounded-lg text-burgundy text-sm font-medium py-3 hover:bg-burgundy hover:text-white hover:border-burgundy transition-colors"
      >
        <LogOut size={16} />
        Güvenli Çıkış
      </button>

      <Link
        href="/"
        className="flex items-center justify-center gap-1 mt-6 text-sm text-ink/50 hover:text-burgundy transition-colors"
      >
        Ana Sayfaya Dön
        <ChevronRight size={14} />
      </Link>
    </main>
  );
}