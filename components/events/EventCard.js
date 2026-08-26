"use client";

import { ArrowUpRight } from "lucide-react";

export default function EventCard({ event }) {
  return (
    <article className="group relative aspect-[1.35/1] min-h-[250px] overflow-hidden border border-white/15 bg-zinc-950 sm:aspect-[1.2/1] lg:aspect-[1.42/1]">
      <img
        src={event.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0 font-mono uppercase">
          <p className="text-[11px] tracking-[0.16em] text-zinc-200">
            {event.date}
          </p>
          <h3 className="mt-2 truncate text-lg tracking-[0.16em] text-white sm:text-xl">
            {event.shortTitle || event.title}
          </h3>
        </div>
        <button
          type="button"
          aria-label={`View ${event.shortTitle || event.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/30 text-white transition group-hover:border-[#a95bf4] group-hover:bg-[#a95bf4] group-hover:text-black"
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
    </article>
  );
}
