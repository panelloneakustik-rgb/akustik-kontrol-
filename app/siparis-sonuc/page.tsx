"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

function ResultContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const orderId = params.get("order");
  const success = status === "success";

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-24 max-w-lg mx-auto text-center">
      {success ? (
        <CheckCircle2 size={56} className="mx-auto mb-4 text-green-600" />
      ) : (
        <XCircle size={56} className="mx-auto mb-4 text-burgundy" />
      )}

      <h1 className="font-display text-3xl text-ink mb-3">
        {success ? "Ödemeniz Alındı!" : "Ödeme Tamamlanamadı"}
      </h1>

      <p className="text-ink/60 mb-6">
        {success
          ? `Sipariş ${orderId ? `AK-${orderId}` : ""} başarıyla ödendi. E-faturan kesilince Hesabım → Siparişlerim’de siparişi açıp “E-Faturayı gör” ile açabilirsin.`
          : "Ödeme sırasında bir sorun oluştu. Kartına herhangi bir tutar çekilmediyse tekrar deneyebilirsin."}
      </p>

      <Link
        href={success ? "/hesabim" : "/sepet"}
        className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark transition-colors"
      >
        {success ? "Siparişlerim" : "Sepete Dön"}
      </Link>
    </main>
  );
}

export default function OrderResultPage() {
  return (
    <Suspense fallback={<main className="px-4 sm:px-6 lg:px-8 py-24 text-center text-ink/50">Yükleniyor...</main>}>
      <ResultContent />
    </Suspense>
  );
}