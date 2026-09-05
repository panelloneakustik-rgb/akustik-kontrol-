"use client";

import { Suspense } from "react";
import ProductDetailClient from "@/components/ProductDetailClient";

function ProductView() {
  return <ProductDetailClient />;
}

export default function ProductPage() {
  return (
    <Suspense fallback={<main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>}>
      <ProductView />
    </Suspense>
  );
}
