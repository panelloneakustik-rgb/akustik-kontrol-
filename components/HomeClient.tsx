"use client";

import { useEffect, useState } from "react";
import Hero from "./Hero";
import BestSellers from "./BestSellers";
import { getBestsellers, getHeroSlides, type HeroSlide, type Product } from "@/lib/api";

export default function HomeClient({
  initialBestsellers = [],
  initialHeroSlides = [],
}: {
  initialBestsellers?: Product[];
  initialHeroSlides?: HeroSlide[];
}) {
  const [bestsellers, setBestsellers] = useState<Product[]>(initialBestsellers);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialHeroSlides);

  useEffect(() => {
    getBestsellers()
      .then(setBestsellers)
      .catch(() => {});
    getHeroSlides()
      .then(setHeroSlides)
      .catch(() => {});
  }, []);

  return (
    <>
      <Hero slides={heroSlides} />
      <BestSellers products={bestsellers} />
    </>
  );
}
