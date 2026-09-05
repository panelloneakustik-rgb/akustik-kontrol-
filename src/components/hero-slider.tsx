"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      5500
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative h-[220px] sm:h-[340px] lg:h-[420px]">
        {heroSlides.map((slide, i) => (
          <div
            key={slide.title}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/35 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
              {slide.badge ? (
                <span className="mb-2 inline-block w-fit bg-burgundy px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  {slide.badge}
                </span>
              ) : null}
              <h1 className="max-w-xl font-display text-2xl text-white sm:text-4xl lg:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base">
                {slide.subtitle}
              </p>
              <Link
                href="/urunler"
                className="mt-5 inline-flex h-11 w-fit items-center bg-burgundy px-6 text-sm font-medium text-white hover:bg-burgundy-dark"
              >
                Ürünleri İncele
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Slayt ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 w-2 rounded-full",
              i === index ? "bg-white" : "bg-white/40"
            )}
          />
        ))}
      </div>
    </section>
  );
}
