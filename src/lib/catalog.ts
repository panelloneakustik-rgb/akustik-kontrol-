export type CategorySlug = "sungerler" | "paneller" | "aksesuar";

export type Product = {
  id: number;
  name: string;
  slug: string;
  category: CategorySlug;
  image: string;
  images: string[];
  price: number;
  discountPercent: number;
  isNew: boolean;
  isBestseller: boolean;
  stock: number;
  dimensions: string;
  material: string;
  color: string;
  description: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
};

export const categories: Category[] = [
  { slug: "sungerler", name: "Akustik Süngerler" },
  { slug: "paneller", name: "Akustik Paneller" },
  { slug: "aksesuar", name: "Aksesuar" },
];

export const products: Product[] = [
  {
    id: 7,
    name: "Piramit Ses Yalıtım Süngeri",
    slug: "piramit-ses-yalitim-sungeri",
    category: "sungerler",
    image: "/media/piramit.jpg",
    images: ["/media/piramit.jpg", "/media/sunger.jpg"],
    price: 550,
    discountPercent: 0,
    isNew: true,
    isBestseller: true,
    stock: 99,
    dimensions: "100 x 100 x 4 cm",
    material: "Açık hücreli poliüretan akustik sünger",
    color: "Antrasit Gri",
    description:
      "Piramit formu yankıyı kırar, stüdyo, ev sineması ve ofislerde net bir akustik sağlar. 100x100 cm plakalar halinde kesilir; yapıştırıcı aksesuarı ile duvara kolay uygulanır.",
  },
  {
    id: 8,
    name: "Labirent Akustik Sünger",
    slug: "labirent-akustik-sunger",
    category: "sungerler",
    image: "/media/sunger.jpg",
    images: ["/media/sunger.jpg", "/media/piramit.jpg"],
    price: 620,
    discountPercent: 8,
    isNew: false,
    isBestseller: true,
    stock: 64,
    dimensions: "100 x 100 x 5 cm",
    material: "Yüksek yoğunluklu akustik sünger",
    color: "Antrasit",
    description:
      "Labirent yüzey, geniş bir frekans aralığında sesi hapseder. Kayıt odaları ve prova stüdyoları için tercih edilir.",
  },
  {
    id: 9,
    name: "Düz Akustik Sünger",
    slug: "duz-akustik-sunger",
    category: "sungerler",
    image: "/media/sunger.jpg",
    images: ["/media/sunger.jpg"],
    price: 390,
    discountPercent: 0,
    isNew: false,
    isBestseller: true,
    stock: 120,
    dimensions: "100 x 100 x 3 cm",
    material: "Poliüretan akustik sünger",
    color: "Gri",
    description:
      "Düz yüzeyli plaka; tavan, makine dairesi ve teknik hacimlerde ekonomik ses yutumu sağlar.",
  },
  {
    id: 10,
    name: "Basotect Piramit Sünger",
    slug: "basotect-piramit-sunger",
    category: "sungerler",
    image: "/media/piramit.jpg",
    images: ["/media/piramit.jpg"],
    price: 890,
    discountPercent: 0,
    isNew: true,
    isBestseller: true,
    stock: 42,
    dimensions: "100 x 50 x 5 cm",
    material: "Melamin köpük (Basotect)",
    color: "Açık Gri",
    description:
      "Yanmaz melamin köpük; restoran, ofis ve kamu alanlarında hem yutum hem yangın sınıfı bekleyen projeler için.",
  },
  {
    id: 11,
    name: "Bass Trap Küpü",
    slug: "bass-trap-kupu",
    category: "sungerler",
    image: "/media/sunger.jpg",
    images: ["/media/sunger.jpg"],
    price: 740,
    discountPercent: 5,
    isNew: false,
    isBestseller: false,
    stock: 28,
    dimensions: "30 x 30 x 60 cm",
    material: "Yüksek yoğunluklu akustik sünger",
    color: "Antrasit",
    description:
      "Oda köşelerindeki bas birikimini azaltır. Müzik odası ve ev stüdyosu köşe uygulamaları için üretilir.",
  },
  {
    id: 12,
    name: "Bariyerli Bondex Sünger",
    slug: "bariyerli-bondex-sunger",
    category: "sungerler",
    image: "/media/sunger.jpg",
    images: ["/media/sunger.jpg", "/media/hero3.jpg"],
    price: 980,
    discountPercent: 0,
    isNew: false,
    isBestseller: true,
    stock: 35,
    dimensions: "100 x 100 x 3 cm",
    material: "Bondex sünger + ses yalıtım bariyeri",
    color: "Siyah / Gri",
    description:
      "Bondex sünger ile ağır ses bariyerinin birleşimi. Komşu duvar, stüdyo kabin ve makine dairesi yalıtımında kullanılır.",
  },
  {
    id: 13,
    name: "Kumaş Kaplı Akustik Panel",
    slug: "kumas-kapli-akustik-panel",
    category: "paneller",
    image: "/media/hero2.jpg",
    images: ["/media/hero2.jpg", "/media/hero1.jpg"],
    price: 1250,
    discountPercent: 10,
    isNew: true,
    isBestseller: true,
    stock: 22,
    dimensions: "120 x 60 x 4 cm",
    material: "Cam yünü + akustik kumaş",
    color: "Antrasit Kumaş",
    description:
      "Dekoratif kumaş kaplı yutucu panel. Toplantı odası, restoran ve ofis duvarlarında hem görünüm hem akustik konfor sağlar.",
  },
  {
    id: 14,
    name: "3D Akustik Duvar Paneli",
    slug: "3d-akustik-duvar-paneli",
    category: "paneller",
    image: "/media/hero1.jpg",
    images: ["/media/hero1.jpg"],
    price: 1450,
    discountPercent: 0,
    isNew: true,
    isBestseller: false,
    stock: 18,
    dimensions: "60 x 60 x 3 cm",
    material: "MDF + kumaş / sünger kompozit",
    color: "Füme",
    description:
      "Üç boyutlu yüzey, mekan akustiğini düzenlerken duvara mimari bir doku katar.",
  },
  {
    id: 15,
    name: "Akustik Asma Tavan Paneli",
    slug: "akustik-asma-tavan-paneli",
    category: "paneller",
    image: "/media/hero3.jpg",
    images: ["/media/hero3.jpg"],
    price: 1680,
    discountPercent: 0,
    isNew: false,
    isBestseller: true,
    stock: 16,
    dimensions: "120 x 60 cm",
    material: "Mineral yün + akustik tül",
    color: "Beyaz",
    description:
      "Açık ofis ve restoran tavanlarında yankıyı düşüren asma tavan paneli. Hızlı teslimat ve saha uygulaması ile sunulur.",
  },
  {
    id: 16,
    name: "Akustik Yapıştırıcı",
    slug: "akustik-yapistirici",
    category: "aksesuar",
    image: "/media/sunger.jpg",
    images: ["/media/sunger.jpg"],
    price: 185,
    discountPercent: 0,
    isNew: false,
    isBestseller: true,
    stock: 200,
    dimensions: "5 kg kova",
    material: "Su bazlı montaj yapıştırıcısı",
    color: "Beyaz",
    description:
      "Akustik sünger ve panel montajı için üretilmiş, solventsiz yapıştırıcı. Yaklaşık 8–10 m² uygulama.",
  },
  {
    id: 17,
    name: "EPDM Ağır Ses Bariyeri",
    slug: "epdm-agir-ses-bariyeri",
    category: "aksesuar",
    image: "/media/hero3.jpg",
    images: ["/media/hero3.jpg"],
    price: 1120,
    discountPercent: 0,
    isNew: false,
    isBestseller: false,
    stock: 40,
    dimensions: "5 m x 1 m rulo",
    material: "EPDM ağır bariyer",
    color: "Siyah",
    description:
      "Yüksek yüzey ağırlığı ile ses geçişini keser. Duvar, asma tavan ve kapı içi uygulamalarında sünger ile birlikte kullanılır.",
  },
  {
    id: 18,
    name: "Akustik Strip Bant",
    slug: "akustik-strip-bant",
    category: "aksesuar",
    image: "/media/sunger.jpg",
    images: ["/media/sunger.jpg"],
    price: 95,
    discountPercent: 0,
    isNew: false,
    isBestseller: false,
    stock: 150,
    dimensions: "3 mm x 50 mm x 10 m",
    material: "Kendinden yapışkanlı EPDM",
    color: "Siyah",
    description:
      "Kapı ve çerçeve çevresindeki ses kaçaklarını kapatmak için şerit bant.",
  },
];

export const heroSlides = [
  {
    image: "/media/hero1.jpg",
    badge: "Yeni Koleksiyon",
    title: "Akustik Ses Yalıtım Süngerleri",
    subtitle: "Şıklık ve sessizlik bir arada",
  },
  {
    image: "/media/hero2.jpg",
    badge: "",
    title: "Akustik Panel Sistemleri",
    subtitle: "Ofis, restoran ve stüdyo için dekoratif yutum",
  },
  {
    image: "/media/hero3.jpg",
    badge: "",
    title: "Akustik Tavan Sistemleri",
    subtitle: "Yankısız, net ve konforlu mekanlar",
  },
];

export const storeInfo = {
  name: "Ümraniye Mağazası",
  address: "İnkılap Mah. Göktan Sk. Taş Apt. No:7 A Ümraniye/İstanbul",
  phoneDisplay: "0 216 630 21 41",
  phoneHref: "tel:+902166302141",
  hours: "Pazartesi – Cuma, 09:00 – 18:00",
  maps: "https://www.google.com/maps/search/?api=1&query=%C4%B0nk%C4%B1lap+Mah.+G%C3%B6ktan+Sk.+Ta%C5%9F+Apt.+No:7+A+%C3%9Cmraniye",
  whatsapp: "https://wa.me/902166302141",
};

export function discountedPrice(product: Product) {
  if (!product.discountPercent) return product.price;
  return Math.round(product.price * (1 - product.discountPercent / 100));
}

export function formatTL(value: number) {
  return (
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value) +
    " TL"
  );
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getByCategory(slug?: string) {
  if (!slug) return products;
  return products.filter((p) => p.category === slug);
}

export function getBestsellers() {
  return products.filter((p) => p.isBestseller);
}

export function searchProducts(query: string) {
  const q = query.trim().toLocaleLowerCase("tr");
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLocaleLowerCase("tr").includes(q) ||
      p.description.toLocaleLowerCase("tr").includes(q) ||
      p.material.toLocaleLowerCase("tr").includes(q)
  );
}

export function relatedProducts(product: Product) {
  return products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);
}

export function categoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
