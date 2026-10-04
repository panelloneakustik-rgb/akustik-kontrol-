"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { initializePayment, PaymentUnavailableError } from "@/lib/orders";

function PaymentForm() {
  const params = useSearchParams();
  const orderId = Number(params.get("id"));
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    initializePayment(orderId)
      .then(({ checkout_form_content }) => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = checkout_form_content;

        const scripts = containerRef.current.querySelectorAll("script");
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
      })
      .catch((err) => {
        if (err instanceof PaymentUnavailableError) {
          setRecorded(true);
          return;
        }
        setError(err instanceof Error ? err.message : "Ödeme başlatılamadı.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-lg mx-auto">
      <h1 className="font-display text-3xl text-ink mb-2 text-center">
        {recorded ? "Siparişiniz alındı" : "Ödeme"}
      </h1>
      {orderId ? (
        <p className="text-center text-ink/50 text-sm mb-8">Sipariş kodu: AK-{orderId}</p>
      ) : (
        <p className="text-center text-burgundy text-sm mb-8">Sipariş bulunamadı.</p>
      )}

      {loading && <p className="text-center text-ink/50 text-sm">Ödeme formu hazırlanıyor...</p>}
      {recorded && (
        <div className="text-center flex flex-col items-center gap-4">
          <p className="text-ink/70 text-sm leading-relaxed">
            Siparişiniz kaydedildi. Ödeme ve teslimat için sizinle iletişime geçeceğiz.
          </p>
          <Link
            href={orderId ? "/hesabim/siparisler" : "/"}
            className="inline-block bg-burgundy text-white text-sm font-medium py-3 px-6 hover:bg-burgundy-dark"
          >
            Siparişlerim
          </Link>
        </div>
      )}
      {error && <p className="text-center text-burgundy text-sm">{error}</p>}

      <div ref={containerRef} id="iyzipay-checkout-form" className="responsive" />
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>}>
      <PaymentForm />
    </Suspense>
  );
}
