"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Heart, UserRound, X } from "lucide-react";
import { clubbers } from "@/data/clubbers";
import { useEventActivity } from "@/components/social/EventActivityProvider";

export default function EventCard({ event }) {
  const [openList, setOpenList] = useState(null);
  const { activity, setEventStatus, pendingEventId, error } = useEventActivity();
  const userStatus = activity[event.id];
  const saving = pendingEventId === event.id;
  const interested = clubbers.filter((clubber) =>
    clubber.events?.some(
      (entry) =>
        entry.eventId === event.id && entry.status === "interested",
    ),
  );
  const going = clubbers.filter((clubber) =>
    clubber.events?.some(
      (entry) => entry.eventId === event.id && entry.status === "going",
    ),
  );
  const visiblePeople = openList === "going" ? going : interested;

  const openAttendees = (status) => {
    setOpenList((current) => (current === status ? null : status));
  };

  return (
    <article className="group relative aspect-[1.35/1] min-h-[250px] overflow-hidden border border-white/15 bg-zinc-950 sm:aspect-[1.2/1] lg:aspect-[1.42/1]">
      <Image
        src={event.image}
        alt=""
        fill
        sizes="(min-width: 1280px) 32vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="min-w-0 font-mono uppercase">
          <p className="text-[11px] tracking-[0.16em] text-zinc-200">
            {event.date}
          </p>
          <h3 className="mt-2 truncate text-lg tracking-[0.16em] text-white sm:text-xl">
            {event.shortTitle || event.title}
          </h3>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openAttendees("interested")}
            aria-expanded={openList === "interested"}
            className={`flex h-10 items-center justify-center gap-2 border px-3 font-mono text-[9px] uppercase tracking-[0.12em] transition active:scale-[0.98] sm:text-[10px] ${
              openList === "interested"
                ? "border-white bg-white text-black"
                : "border-white/25 bg-black/50 text-white backdrop-blur-md hover:border-[#c58aff]"
            }`}
          >
            <Heart size={13} fill={userStatus === "interested" ? "currentColor" : "none"} />
            Interested · {interested.length + (userStatus === "interested" ? 1 : 0)}
          </button>
          <button
            type="button"
            onClick={() => openAttendees("going")}
            aria-expanded={openList === "going"}
            className={`flex h-10 items-center justify-center gap-2 border px-3 font-mono text-[9px] uppercase tracking-[0.12em] transition active:scale-[0.98] sm:text-[10px] ${
              openList === "going"
                ? "border-[#c58aff] bg-[#a95bf4] text-black"
                : "border-white/25 bg-black/50 text-white backdrop-blur-md hover:border-[#c58aff]"
            }`}
          >
            <CheckCircle2 size={13} />
            Going · {going.length + (userStatus === "going" ? 1 : 0)}
          </button>
        </div>
      </div>

      {openList && (
        <div className="absolute inset-0 z-20 flex flex-col bg-zinc-950/98 p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c58aff]">
                {openList === "going" ? "Paid attendees" : "People interested"}
              </p>
              <h4 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                {event.shortTitle || event.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setOpenList(null)}
              aria-label="Close attendee list"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/20 text-zinc-300 transition hover:border-white/60 hover:text-white active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
            {visiblePeople.length ? (
              <div className="space-y-2">
                {visiblePeople.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 bg-white/[0.055] p-2.5"
                  >
                    <Image
                      src={person.image}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{person.name}, {person.age}</p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">{person.music.slice(0, 2).join(" · ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-16 items-center gap-3 text-sm text-zinc-500">
                <UserRound size={18} /> Be the first in this list.
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={saving || userStatus === openList}
            onClick={() => setEventStatus(event.id, openList)}
            className={`mt-4 h-10 w-full px-4 text-xs font-semibold transition active:scale-[0.98] ${
              userStatus === openList
                ? "border border-[#c58aff] bg-transparent text-[#d9b5ff]"
                : "bg-white text-black hover:bg-[#c58aff]"
            } disabled:cursor-default disabled:opacity-70`}
          >
            {saving
              ? "Saving..."
              : userStatus === openList
              ? `Your status: ${openList === "going" ? "Going" : "Interested"}`
              : openList === "going"
                ? "Set as going"
                : "I'm interested"}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-center text-[11px] leading-4 text-red-300">
              {error}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
