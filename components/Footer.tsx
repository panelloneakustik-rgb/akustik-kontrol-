import Link from "next/link";
import { Facebook, Instagram, Twitter, Phone, MapPin } from "lucide-react";

function BrandMark() {
  return (
    <svg viewBox="0 0 78 70" className="h-[54px] w-[60px] shrink-0" aria-hidden>
      <defs>
        <clipPath id="ak-footer-tri">
          <path d="M6 4v62h64Z" />
        </clipPath>
      </defs>
      <path d="M6 4v62h64Z" fill="#D33B28" />
      <g
        clipPath="url(#ak-footer-tri)"
        fill="none"
        stroke="#F7F4EF"
        strokeWidth="5.2"
      >
        <path d="M6 50a20 20 0 0 1 20 16" />
        <path d="M6 36a34 34 0 0 1 34 30" />
        <path d="M6 20a50 50 0 0 1 50 46" />
      </g>
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "Pinterest", href: "https://tr.pinterest.com/akustikkontrol/", icon: "pinterest" as const },
  { label: "X", href: "https://x.com/AkustikKontrol", icon: Twitter },
  { label: "Facebook", href: "https://www.facebook.com/akustikkontrol", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/akustikkontrol/", icon: Instagram },
];

const LEGAL_LINKS = [
  { label: "Çerez Politikası", href: "/cerez-politikasi" },
  { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
  { label: "Aydınlatma Metni", href: "/aydinlatma-metni" },
];

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.567-.994 3.992-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function SocialLink({ label, href, icon }: { label: string; href: string; icon: typeof Twitter | "pinterest" }) {
  const Icon = icon === "pinterest" ? PinterestIcon : icon;
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-md bg-burgundy text-white flex items-center justify-center hover:bg-burgundy-dark transition-colors"
    >
      <Icon size={18} />
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink/10 bg-cream">
      <div className="px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center text-center md:flex-row md:text-left md:flex-wrap md:items-center md:justify-between gap-8 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <BrandMark />
          <span className="flex flex-col items-stretch text-left text-black">
            <span className="font-display font-semibold text-[18px] sm:text-[21px] leading-none tracking-[0.08em] uppercase">
              AKUSTİK KONTROL
            </span>
            <span className="mt-[6px] mb-[5px] h-px w-full bg-[#7A1E28]" />
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0" aria-hidden>
                <path d="M4 .4 7.6 7.2H.4Z" fill="#D33B28" />
              </svg>
              <span className="font-sans font-medium text-[8px] sm:text-[9px] leading-none tracking-[0.185em] uppercase">
                SES YALITIM SİSTEMLERİ
              </span>
            </span>
          </span>
        </Link>

        <div className="flex flex-col items-center gap-3">
          <span className="text-sm font-semibold text-ink">Bizi Takip Et</span>
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((s) => (
              <SocialLink key={s.label} label={s.label} href={s.href} icon={s.icon} />
            ))}
          </div>
        </div>

        <div className="text-sm text-ink/70 flex flex-col gap-1 items-center md:items-end">
          <a href="tel:+902166302141" className="flex items-center gap-2 text-burgundy font-semibold">
            <Phone size={16} />
            0 216 630 21 41
          </a>
          <span className="flex items-center gap-2 text-right max-w-xs">
            <MapPin size={16} className="shrink-0" />
            İnkılap Mah. Göktan Sk. Taş Apt. No:7 A Ümraniye/İstanbul
          </span>
        </div>
      </div>

      <div className="border-t border-ink/10 px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto text-xs text-ink/50">
        <span>© {new Date().getFullYear()} AKUSTİK KONTROL. Tüm Hakları Saklıdır.</span>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-burgundy">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}