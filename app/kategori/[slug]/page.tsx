import CategoryClient from "@/components/CategoryClient";
import { getCategories } from "@/lib/api";

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  const slugs = categories.map((c) => ({ slug: c.slug }));
  const fallback = ["panel", "aksesuar", "dekoratif", "koltuk", "sehpa", "kose-koltuk"];
  const have = new Set(slugs.map((s) => s.slug));
  for (const slug of fallback) {
    if (!have.has(slug)) slugs.push({ slug });
  }
  return slugs;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryClient slug={slug} />;
}
