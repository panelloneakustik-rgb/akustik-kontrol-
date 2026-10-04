import { Truck } from "lucide-react";

export default function FreeShippingBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Kargo bedava kampanyası"
      className={`campaign-glow relative overflow-hidden flex items-start gap-2.5 rounded-xl border border-gold/35 bg-[#F4EFE8] text-ink ${
        compact ? "px-3 py-2.5" : "px-3.5 py-3"
      }`}
    >
      <span className="campaign-sheen pointer-events-none absolute inset-0" aria-hidden />
      <Truck size={16} className="relative mt-0.5 shrink-0 text-burgundy" />
      <p className={`relative leading-relaxed ${compact ? "text-xs" : "text-[13px] sm:text-sm"}`}>
        <span className="campaign-hot font-semibold">Kargo Bedava Kampanyası</span>
        <span className="text-ink/45"> — </span>
        İstanbul içi <span className="campaign-hot font-semibold">10.000 TL</span> ve üzeri, İstanbul dışı{" "}
        <span className="campaign-hot font-semibold">20.000 TL</span> ve üzeri alışverişlerde kargo ücretsiz.
      </p>
    </aside>
  );
}
