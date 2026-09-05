import Link from "next/link";
import { Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { storeInfo } from "@/lib/catalog";

const social = [
  {
    label: "Pinterest",
    href: "https://tr.pinterest.com/akustikkontrol/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.994 3.992-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/AkustikKontrol",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L5.2 22H1.93l8.02-9.16L1.5 2h6.76l4.66 6.18L18.244 2zm-1.16 18.2h1.81L7.01 3.69H5.07L17.084 20.2z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/akustikkontrol",
    icon: <Facebook size={18} />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/akustikkontrol/",
    icon: <Instagram size={18} />,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink/10 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-10 text-center sm:px-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:text-left lg:px-8">
        <Link href="/" className="shrink-0 font-display text-xl text-ink">
          AKUSTİK KONTROL
          <span className="-mt-1 block font-sans text-[10px] tracking-[0.25em]">
            SES YALITIM SİSTEMLERİ
          </span>
        </Link>
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-semibold text-ink">Bizi Takip Et</span>
          <div className="flex gap-2">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-burgundy text-white hover:bg-burgundy-dark"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-sm text-ink/70 md:items-end">
          <a
            href={storeInfo.phoneHref}
            className="flex items-center gap-2 font-semibold text-burgundy"
          >
            <Phone size={16} />
            {storeInfo.phoneDisplay}
          </a>
          <span className="flex max-w-xs items-center gap-2 text-right">
            <MapPin size={16} className="shrink-0" />
            {storeInfo.address}
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-4 py-4 text-xs text-ink/50 sm:flex-row sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} AKUSTİK KONTROL. Tüm Hakları Saklıdır.</span>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="/cerez-politikasi" className="hover:text-burgundy">
            Çerez Politikası
          </Link>
          <Link href="/gizlilik-politikasi" className="hover:text-burgundy">
            Gizlilik Politikası
          </Link>
          <Link href="/aydinlatma-metni" className="hover:text-burgundy">
            Aydınlatma Metni
          </Link>
        </div>
      </div>
    </footer>
  );
}
