"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/api";

export default function CategoryBar({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState<Story | null>(null);

  if (stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-cream border-b border-ink/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setActive(story)}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <span className="p-[3px] rounded-full bg-gradient-to-tr from-gold via-burgundy to-amber-400 group-hover:scale-105 transition-transform">
              <span className="relative block w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white">
                <Image src={story.image} alt={story.title} fill className="object-cover" />
              </span>
            </span>
            <span className="text-xs text-ink/80 group-hover:text-burgundy">{story.title}</span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-ink flex flex-col items-center justify-end text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={active.image} alt={active.title} fill className="object-cover" />

            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none z-10"
              aria-label="Kapat"
            >
              &times;
            </button>

            <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3">
              <h3 className="font-display text-2xl">{active.title}</h3>
              {active.link_url && (
                <Link
                  href={active.link_url}
                  className="bg-white text-ink text-sm font-medium py-2 px-4 hover:bg-cream transition-colors"
                >
                  İncele
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}