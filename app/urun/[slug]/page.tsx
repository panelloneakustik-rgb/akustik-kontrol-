import { Suspense } from "react";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProducts } from "@/lib/api";

export async function generateStaticParams() {
  const products = await getProducts().catch(() => []);
  const slugs = products.map((p) => ({ slug: p.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "_none" }];
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<main className="px-4 sm:px-6 lg:px-8 py-16 text-center text-ink/50">Yükleniyor...</main>}>
      <ProductDetailClient />
    </Suspense>
  );
}
