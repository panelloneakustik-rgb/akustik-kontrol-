import { Breadcrumb } from "@/components/breadcrumb";
import { ProductGrid } from "@/components/product-grid";
import { categoryBySlug, getByCategory } from "@/lib/catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  return { title: cat?.name ?? "Kategori" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const list = getByCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ href: "/urunler", label: "Ürünler" }, { label: cat.name }]} />
      <h1 className="mb-8 font-display text-3xl text-ink">{cat.name}</h1>
      <ProductGrid
        products={list}
        empty="Bu kategoride henüz ürün yok."
      />
    </div>
  );
}
