"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/api";

const SEEN_KEY = "ak_stories_seen";
const PHOTO_MS = 5500;

function readSeen(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

function StoryRing({
  story,
  seen,
  onOpen,
}: {
  story: Story;
  seen: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col items-center gap-2 shrink-0 w-[4.75rem] sm:w-24 group"
    >
      <span
        className={`p-[2.5px] rounded-full ${
          seen
            ? "bg-ink/20"
            : "bg-gradient-to-tr from-gold via-burgundy to-amber-400"
        } group-hover:scale-105 transition-transform`}
      >
        <span className="relative block w-[4.25rem] h-[4.25rem] sm:w-[5.25rem] sm:h-[5.25rem] rounded-full overflow-hidden bg-white ring-[3px] ring-cream">
          {story.image ? (
            <Image src={story.image} alt={story.title} fill className="object-cover" sizes="84px" />
          ) : story.video ? (
            <video src={story.video} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 bg-card" />
          )}
        </span>
      </span>
      <span className="text-[11px] sm:text-xs text-ink/80 group-hover:text-burgundy text-center leading-tight line-clamp-2 w-full">
        {story.title}
      </span>
    </button>
  );
}

export default function CategoryBar({ stories }: { stories: Story[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setSeen(readSeen());
  }, []);

  const active = activeIndex === null ? null : stories[activeIndex] ?? null;

  const markSeen = useCallback(
    (id: number) => {
      setSeen((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        writeSeen(next);
        return next;
      });
    },
    []
  );

  const close = useCallback(() => {
    setActiveIndex(null);
    setProgress(0);
    setPaused(false);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex((i) => {
        if (i === null) return i;
        const next = i + dir;
        if (next < 0 || next >= stories.length) {
          setProgress(0);
          setPaused(false);
          return null;
        }
        setProgress(0);
        return next;
      });
    },
    [stories.length]
  );

  useEffect(() => {
    if (!active) return;
    markSeen(active.id);
    setProgress(0);
    setPaused(false);
  }, [active, markSeen]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else void v.play().catch(() => undefined);
  }, [paused, activeIndex]);

  useEffect(() => {
    if (activeIndex === null || paused || active?.video) return;
    const started = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - started) / PHOTO_MS);
      setProgress(p);
      if (p >= 1) go(1);
    };
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [activeIndex, active?.video, paused, go]);

  if (stories.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-cream border-b border-ink/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.map((story, i) => (
          <StoryRing
            key={story.id}
            story={story}
            seen={seen.has(story.id)}
            onOpen={() => setActiveIndex(i)}
          />
        ))}
      </div>

      {active && activeIndex !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-6" onClick={close}>
          <div
            className="relative w-full max-w-[390px] aspect-[9/16] rounded-2xl overflow-hidden bg-ink text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
              {stories.map((s, i) => (
                <span key={s.id} className="h-[2.5px] flex-1 rounded-full bg-white/25 overflow-hidden">
                  <span
                    className="block h-full bg-white origin-left"
                    style={{
                      width:
                        i < activeIndex
                          ? "100%"
                          : i === activeIndex
                            ? `${Math.round(progress * 100)}%`
                            : "0%",
                    }}
                  />
                </span>
              ))}
            </div>

            {active.video ? (
              <video
                key={active.id}
                ref={videoRef}
                src={active.video}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                onTimeUpdate={(e) => {
                  const el = e.currentTarget;
                  if (el.duration) setProgress(el.currentTime / el.duration);
                }}
                onEnded={() => go(1)}
              />
            ) : active.image ? (
              <Image src={active.image} alt={active.title} fill className="object-cover" sizes="390px" />
            ) : null}

            <button
              type="button"
              className="absolute inset-y-0 left-0 w-1/3 z-10"
              aria-label="Önceki"
              onClick={() => go(-1)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 w-1/3 z-10"
              aria-label="Sonraki"
              onClick={() => go(1)}
            />

            <button
              type="button"
              onClick={close}
              className="absolute top-7 right-3 text-white/90 hover:text-white text-2xl leading-none z-30"
              aria-label="Kapat"
            >
              &times;
            </button>

            <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 pointer-events-none">
              <h3 className="font-display text-2xl">{active.title}</h3>
              {active.link_url && (
                active.link_url.startsWith("http") ? (
                  <a
                    href={active.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto self-start bg-white text-ink text-sm font-medium py-2 px-4 hover:bg-cream"
                  >
                    Instagram’da aç
                  </a>
                ) : (
                  <Link
                    href={active.link_url}
                    className="pointer-events-auto self-start bg-white text-ink text-sm font-medium py-2 px-4 hover:bg-cream"
                  >
                    İncele
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
