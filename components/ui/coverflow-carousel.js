"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function CoverflowCarousel({
  slides,
  rotate = 38,
  depth = 0.52,
  perspective = 3.4,
  falloff = 0.58,
  fade = 0.12,
  cardWidth = "clamp(190px, 24vw, 340px)",
  gap = 0.08,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  label = "Featured nights",
  className = "",
  cardClassName = "",
}) {
  const count = slides.length;
  const frameRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef(null);
  const hoverRafRef = React.useRef(null);
  const hoverDirectionRef = React.useRef(0);
  const dragRef = React.useRef(null);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (position) => ((Math.round(position) % count) + count) % count,
    [count],
  );

  const clamp = React.useCallback(
    (position) =>
      loop ? position : Math.max(0, Math.min(count - 1, position)),
    [count, loop],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width || !count) return;

    const pitch = width * (1 + gap);
    const position = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - position;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 78) * Math.sign(offset);
      const edge = loop
        ? Math.min(1, Math.max(0, count / 2 - distance))
        : 1;

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
      card.style.opacity = String(
        Math.max(0, 1 - fade * distance) * edge,
      );
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const stopHoverMotion = React.useCallback(() => {
    hoverDirectionRef.current = 0;
    if (hoverRafRef.current !== null) {
      cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = null;
    }
  }, []);

  const startHoverMotion = React.useCallback(() => {
    if (hoverRafRef.current !== null) return;

    const step = () => {
      const direction = hoverDirectionRef.current;
      if (direction === 0 || dragRef.current) {
        hoverRafRef.current = null;
        return;
      }

      // Move the physical cards towards the cursor. Speed increases gradually
      // from the centre dead zone to the outer edge of the frame.
      const speed = 0.1 + Math.abs(direction) * 0.12;
      posRef.current = clamp(
        posRef.current - Math.sign(direction) * speed,
      );
      targetRef.current = posRef.current;
      setSelected(indexAt(posRef.current));
      paint();
      hoverRafRef.current = requestAnimationFrame(step);
    };

    hoverRafRef.current = requestAnimationFrame(step);
  }, [clamp, indexAt, paint]);

  const settle = React.useCallback(
    (target) => {
      stopHoverMotion();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint, stopHoverMotion],
  );

  const goTo = React.useCallback(
    (index) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const handlePointerDown = (event) => {
    stopHoverMotion();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      velocity: 0,
      time: performance.now(),
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) {
      if (event.pointerType !== "mouse") return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = (event.clientX - bounds.left) / bounds.width;
      const centred = Math.max(-1, Math.min(1, (position - 0.5) * 2));
      const deadZone = 0.18;

      hoverDirectionRef.current =
        Math.abs(centred) <= deadZone
          ? 0
          : Math.sign(centred) *
            ((Math.abs(centred) - deadZone) / (1 - deadZone));

      if (hoverDirectionRef.current === 0) {
        stopHoverMotion();
      } else {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        startHoverMotion();
      }
      return;
    }

    if (drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.velocity =
      ((posRef.current - previous) / Math.max(now - drag.time, 1)) * 1000;
    drag.time = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.velocity * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType !== "mouse" || dragRef.current) return;
    stopHoverMotion();
    settle(clamp(Math.round(posRef.current)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (hoverRafRef.current !== null) {
        cancelAnimationFrame(hoverRafRef.current);
      }
    },
    [],
  );

  if (!count) return null;
  const active = slides[selected];

  return (
    <div
      className={`w-full ${className}`}
      style={{ "--cf-card": cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={handlePointerLeave}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-8 outline-none focus-visible:ring-2 focus-visible:ring-[#c58aff] active:cursor-grabbing sm:py-12"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{ height: "calc(var(--cf-card) * 1.28)", transformStyle: "preserve-3d" }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id ?? slide.src}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                tabIndex={0}
                onFocus={() => goTo(index)}
                onClick={() => {
                  if (!dragRef.current) goTo(index);
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className={`absolute left-1/2 top-0 aspect-[4/5] cursor-pointer overflow-hidden border border-white/15 bg-zinc-950 shadow-[0_28px_80px_rgba(0,0,0,0.55)] outline-none will-change-transform focus-visible:border-[#c58aff] focus-visible:ring-2 focus-visible:ring-[#c58aff] ${cardClassName}`}
                style={{ width: "var(--cf-card)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  className="h-full w-full select-none object-cover grayscale-[12%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c58aff]">
                    {slide.kicker}
                  </p>
                  <p className="mt-2 text-xl font-medium uppercase tracking-[-0.025em] text-white sm:text-2xl">
                    {slide.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <div className="pointer-events-none absolute inset-x-4 top-1/2 z-[200] flex -translate-y-1/2 justify-between sm:inset-x-8">
            <button
              type="button"
              aria-label="Previous night"
              onClick={() => nudge(-1)}
              className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/20 bg-black/75 text-white backdrop-blur transition hover:border-[#c58aff] hover:bg-[#1a111f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c58aff] active:scale-95"
            >
              <ChevronLeft aria-hidden="true" size={18} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              aria-label="Next night"
              onClick={() => nudge(1)}
              className="pointer-events-auto grid size-11 place-items-center rounded-full border border-white/20 bg-black/75 text-white backdrop-blur transition hover:border-[#c58aff] hover:bg-[#1a111f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c58aff] active:scale-95"
            >
              <ChevronRight aria-hidden="true" size={18} strokeWidth={1.6} />
            </button>
          </div>
        )}
      </div>

      {showCaption && active?.title && (
        <div key={selected} className="mx-auto mt-2 max-w-xl px-6 text-center">
          <p className="text-lg font-medium tracking-[-0.025em] text-white">
            {active.title}
          </p>
          {active.subtitle && (
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {active.subtitle}
            </p>
          )}
          {active.meta?.length > 0 && (
            <dl className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em]">
              {active.meta.map((row) => (
                <div key={row.label} className="flex gap-2">
                  <dt className="text-zinc-600">{row.label}</dt>
                  <dd className="text-zinc-300">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-7 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id ?? slide.src}
              type="button"
              aria-label={`Go to night ${index + 1}`}
              aria-current={index === selected ? "true" : undefined}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c58aff] ${
                index === selected
                  ? "w-7 bg-[#a95bf4]"
                  : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
