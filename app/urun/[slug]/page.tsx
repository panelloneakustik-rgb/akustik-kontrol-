import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductBySlug, getProducts } from "@/lib/api";

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts().catch(() => []);
  const slugs = products.map((p) => ({ slug: p.slug }));
  return slugs.length > 0 ? slugs : [{ slug: "_none" }];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = slug && slug !== "_none" ? await getProductBySlug(slug).catch(() => null) : null;
  return <ProductDetailClient slug={slug} initial={product} />;
}
