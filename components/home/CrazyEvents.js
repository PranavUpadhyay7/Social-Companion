"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventProps from "./EventProps";
import { events } from "@/data/events";

export default function CrazyEvents() {
  const railRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const featuredEvents = events.slice(0, 8);

  const moveTo = useCallback(
    (nextIndex) => {
      const rail = railRef.current;
      if (!rail) return;

      const normalizedIndex =
        (nextIndex + featuredEvents.length) % featuredEvents.length;
      const firstCard = rail.firstElementChild;
      if (!firstCard) return;

      const gap = parseFloat(getComputedStyle(rail).columnGap) || 16;
      const step = firstCard.getBoundingClientRect().width + gap;
      rail.scrollTo({ left: step * normalizedIndex, behavior: "smooth" });
      setActiveIndex(normalizedIndex);
    },
    [featuredEvents.length],
  );

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % featuredEvents.length;
        const rail = railRef.current;
        const firstCard = rail?.firstElementChild;

        if (rail && firstCard) {
          const gap = parseFloat(getComputedStyle(rail).columnGap) || 16;
          const step = firstCard.getBoundingClientRect().width + gap;
          rail.scrollTo({ left: step * next, behavior: "smooth" });
        }

        return next;
      });
    }, 3200);

    return () => window.clearInterval(interval);
  }, [featuredEvents.length, paused]);

  const updateScrollProgress = () => {
    const rail = railRef.current;
    if (!rail) return;

    const maximumScroll = rail.scrollWidth - rail.clientWidth;
    const percentage =
      maximumScroll > 0 ? (rail.scrollLeft / maximumScroll) * 100 : 100;
    setScrollProgress(Math.min(100, Math.max(0, Math.round(percentage))));

    const firstCard = rail.firstElementChild;
    if (firstCard) {
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 16;
      const step = firstCard.getBoundingClientRect().width + gap;
      setActiveIndex(
        Math.min(featuredEvents.length - 1, Math.round(rail.scrollLeft / step)),
      );
    }
  };

  return (
    <section className="overflow-hidden pb-28 pt-12 text-white sm:pt-20">
      <div className="flex items-end justify-between gap-8 px-5 sm:px-8 lg:px-10">
        <h2 className="relative text-3xl font-medium uppercase tracking-[0.16em] text-zinc-100 sm:text-5xl">
          Featured Events
          <sup className="absolute -right-7 top-0 font-mono text-[9px] font-normal tracking-normal text-zinc-400 sm:-right-8 sm:text-[10px]">
            {String(featuredEvents.length).padStart(2, "0")}
          </sup>
        </h2>

        <div className="hidden items-center gap-4 pb-2 sm:flex">
          <div className="w-36">
            <span className="font-mono text-[10px] text-zinc-400">
              {scrollProgress}%
            </span>
            <div className="mt-2 h-px bg-zinc-700">
              <div
                className="h-px bg-zinc-200 transition-[width] duration-500"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            aria-label="Previous featured event"
            onClick={() => moveTo(activeIndex - 1)}
            className="flex h-10 w-10 items-center justify-center bg-zinc-800 text-zinc-200 transition hover:bg-zinc-100 hover:text-black"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next featured event"
            onClick={() => moveTo(activeIndex + 1)}
            className="flex h-10 w-10 items-center justify-center bg-zinc-800 text-zinc-200 transition hover:bg-zinc-100 hover:text-black"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        onScroll={updateScrollProgress}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 [scrollbar-width:none] sm:px-8 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {featuredEvents.map((event) => (
          <EventProps key={event.id} event={event} />
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-2 px-5 sm:hidden">
        <button
          type="button"
          aria-label="Previous featured event"
          onClick={() => moveTo(activeIndex - 1)}
          className="flex h-10 w-10 items-center justify-center bg-zinc-800"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next featured event"
          onClick={() => moveTo(activeIndex + 1)}
          className="flex h-10 w-10 items-center justify-center bg-zinc-800"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
