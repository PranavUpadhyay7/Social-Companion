"use client";

import { SlidersHorizontal } from "lucide-react";
import EventCard from "./EventCard";

export default function EventGrid({ events, onFilterClick }) {
  const priority = ["Night Signal", "After Dark", "Rooftop Sessions"];
  const orderedEvents = [...events].sort((a, b) => {
    const aIndex = priority.indexOf(a.shortTitle);
    const bIndex = priority.indexOf(b.shortTitle);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  const featuredRow = orderedEvents.slice(0, 3);
  const remainingEvents = orderedEvents.slice(3);

  return (
    <section
      id="upcoming-events"
      className="mx-auto max-w-[1920px] scroll-mt-6 px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10"
    >
      <div className="mb-6 flex items-center justify-between gap-5 sm:mb-7">
        <h2 className="font-mono text-xl uppercase tracking-[0.2em] text-white sm:text-3xl lg:text-[32px]">
          Upcoming Events
        </h2>
        <button
          type="button"
          onClick={onFilterClick}
          className="flex h-11 shrink-0 items-center gap-2.5 border border-zinc-700 bg-black/60 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-200 transition hover:border-[#a95bf4] hover:text-white sm:px-5 sm:text-xs"
        >
          <SlidersHorizontal size={15} className="text-[#a95bf4]" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>
      {events.length ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {featuredRow.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {remainingEvents.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              {remainingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-64 items-center justify-center border border-white/15 text-center font-mono uppercase tracking-widest text-zinc-500">
          No events match these filters
        </div>
      )}
    </section>
  );
}
