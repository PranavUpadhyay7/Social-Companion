"use client";

import Image from "next/image";
import { CalendarDays, Check, MapPin, Users } from "lucide-react";

export default function GroupCard({ group, joined, onToggleJoin }) {
  const memberDelta = joined && !group.joined ? 1 : !joined && group.joined ? -1 : 0;
  const visibleMembers = group.members + memberDelta;
  const remaining = group.capacity - visibleMembers;

  return (
    <article className="group overflow-hidden rounded-[18px] bg-zinc-950 shadow-[0_24px_70px_rgba(38,8,55,0.28)]">
      <div className="relative aspect-[1.45/1] overflow-hidden">
        <Image
          src={group.cover}
          alt={`${group.event} venue`}
          fill
          sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#c58aff]">
              {group.date} / {group.vibe}
            </p>
            <p className="mt-2 text-sm font-semibold text-white">{group.event}</p>
          </div>
          <p className="rounded-full bg-black/65 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-300 backdrop-blur-sm">
            {remaining > 0 ? `${remaining} spots left` : "Group full"}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="text-2xl font-medium tracking-[-0.04em] text-white">
          {group.name}
        </h2>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
          {group.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
          <span className="flex items-center gap-2">
            <MapPin size={13} /> {group.city}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays size={13} /> {group.date}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center">
            {group.initials.map((initial, index) => (
              <span
                key={`${group.id}-${initial}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[9px] font-semibold text-zinc-200"
                style={{ marginLeft: index === 0 ? 0 : -8 }}
              >
                {initial}
              </span>
            ))}
            <span className="ml-3 flex items-center gap-1.5 text-xs text-zinc-500">
              <Users size={13} /> {visibleMembers}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleJoin(group.id)}
            disabled={!joined && remaining <= 0}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
              joined
                ? "bg-white text-black"
                : "bg-[#a95bf4] text-black hover:scale-[1.02]"
            }`}
          >
            {joined && <Check size={15} />}
            {joined ? "Joined" : "Join group"}
          </button>
        </div>
      </div>
    </article>
  );
}
