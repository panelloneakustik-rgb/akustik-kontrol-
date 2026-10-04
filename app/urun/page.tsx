"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

function ProductView() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() || "";
  return <ProductDetailClient slug={slug} />;
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</div>}>
      <ProductView />
    </Suspense>
  );
}
