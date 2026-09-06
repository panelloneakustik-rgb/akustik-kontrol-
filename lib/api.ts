const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://api.akustikkontrol.com.tr/api";

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
};

export type ColorSwatch = {
  id: number;
  code: string;
  name: string;
  image: string;
};

export type Story = {
  id: number;
  title: string;
  image: string;
  link_url: string;
  order: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  image: string | null;
  images: string[];
  price: string;
  discount_percent: number;
  discounted_price: string;
  is_new: boolean;
  is_bestseller: boolean;
  stock: number;
};

export type HeroSlide = {
  id: number;
  image: string;
  badge_text: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  order: number;
};


async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export async function getCategories() {
  const data = await getJSON<{ results: Category[] }>("/categories/");
  return data.results;
}

export async function getStories() {
  const data = await getJSON<{ results: Story[] }>("/stories/");
  return data.results;
}

export async function getBestsellers() {
  const data = await getJSON<{ results: Product[] }>("/products/?is_bestseller=true");
  return data.results;
}

export async function getHeroSlides() {
  const data = await getJSON<{ results: HeroSlide[] }>("/hero-slides/");
  return data.results;
}

export async function getProducts(categorySlug?: string) {
  const qs = categorySlug ? `?category__slug=${categorySlug}&page_size=100` : "?page_size=100";
  const data = await getJSON<{ results: Product[] }>(`/products/${qs}`);
  return data.results;
}

export async function searchProducts(query: string) {
  if (!query.trim()) return [];
  const data = await getJSON<{ results: Product[] }>(`/products/?search=${encodeURIComponent(query)}`);
  return data.results;
}

export async function getProductBySlug(slug: string) {
  return getJSON<Product & {
    description: string;
    stock: number;
    dimensions: string;
    density: string;
    thickness: string;
    material: string;
    color: string;
    related_products: Product[];
    color_swatches: ColorSwatch[];
    shipping_days: string;
  }>(`/products/${slug}/`);
}

export function formatTL(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " TL";
}