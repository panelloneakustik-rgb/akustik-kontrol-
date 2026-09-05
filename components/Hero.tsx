"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/api";

const INTERVAL_MS = 4000;

export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 rounded-sm overflow-hidden min-h-[240px] sm:min-h-[400px] lg:min-h-[560px] flex items-center">
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full h-full shrink-0">
            <Image src={slide.image} alt={slide.title || "Hero"} fill priority className="object-cover" />
          </div>
        ))}
      </div>

      {slides[index] && (slides[index].badge_text || slides[index].title || slides[index].subtitle) && (
        <div className="relative px-5 py-10 sm:px-12 sm:py-16 max-w-lg">
          {slides[index].badge_text && (
            <span className="inline-block bg-burgundy text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
              {slides[index].badge_text}
            </span>
          )}
          {slides[index].title && (
            <h1 className="font-display text-3xl sm:text-5xl text-white mb-2">{slides[index].title}</h1>
          )}
          {slides[index].subtitle && (
            <p className="font-display italic text-lg sm:text-2xl text-white/90">{slides[index].subtitle}</p>
          )}
          {slides[index].cta_text && slides[index].cta_link && (
            <Link
              href={slides[index].cta_link}
              className="inline-block mt-6 bg-white text-ink text-sm font-medium py-3 px-6 hover:bg-cream transition-colors"
            >
              {slides[index].cta_text}
            </Link>
          )}
        </div>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              aria-label={`Slayt ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}