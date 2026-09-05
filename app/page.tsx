import HomeClient from "@/components/HomeClient";
import { getBestsellers, getHeroSlides } from "@/lib/api";

export default async function HomePage() {
  let bestsellers = await getBestsellers().catch(() => []);
  let heroSlides = await getHeroSlides().catch(() => []);
  if (bestsellers.length === 0) {
    const { getProducts } = await import("@/lib/api");
    bestsellers = await getProducts().catch(() => []);
  }

  return (
    <HomeClient
      initialBestsellers={bestsellers}
      initialHeroSlides={heroSlides}
    />
  );
}
