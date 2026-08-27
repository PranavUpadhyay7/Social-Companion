"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function EventProps({ event }) {
  return (
    <article className="group relative aspect-[3/4] w-[78vw] max-w-[430px] shrink-0 snap-start overflow-hidden bg-zinc-950 sm:w-[43vw] lg:w-[29vw] xl:w-[24vw]">
      <Image
        src={event.image}
        alt={event.title}
        fill
        sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 29vw, (min-width: 640px) 43vw, 78vw"
        draggable="false"
        className="select-none object-cover transition-transform duration-700 group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <span className="bg-black/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300">
            {event.category}
          </span>
          <h3 className="mt-4 truncate text-xl font-semibold uppercase tracking-[-0.025em] text-white sm:text-2xl">
            {event.shortTitle || event.title}
          </h3>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
            {event.date} · {event.venue}
          </p>
        </div>

        <Link
          href="/events"
          aria-label={`View ${event.shortTitle || event.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/35 text-white transition hover:border-white hover:bg-white hover:text-black"
        >
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
