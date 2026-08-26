"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Check, MapPin, Plus, Search, Users } from "lucide-react";
import { groups as initialGroups, groupVibes } from "@/data/groups";
import GroupCard from "./GroupCard";
import CreateGroupModal from "./CreateGroupModal";

export default function GroupsExplorer() {
  const [groups, setGroups] = useState(initialGroups);
  const [joinedIds, setJoinedIds] = useState(
    () => new Set(initialGroups.filter((group) => group.joined).map((group) => group.id)),
  );
  const [query, setQuery] = useState("");
  const [vibe, setVibe] = useState("All");
  const [view, setView] = useState("discover");
  const [createOpen, setCreateOpen] = useState(false);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return groups.filter((group) => {
      const matchesView = view === "discover" || joinedIds.has(group.id);
      const matchesVibe = vibe === "All" || group.vibe === vibe;
      const matchesQuery =
        !normalizedQuery ||
        [group.name, group.event, group.city, group.vibe, ...group.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesView && matchesVibe && matchesQuery;
    });
  }, [groups, joinedIds, query, vibe, view]);

  const featured = groups[0];
  const featuredJoined = joinedIds.has(featured.id);

  const toggleJoin = (groupId) => {
    setJoinedIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const createGroup = (form) => {
    const newGroup = {
      id: Date.now(),
      name: form.name.trim(),
      event: form.event.trim(),
      date: "NEW",
      venue: "Venue to be decided",
      city: "Your city",
      cover:
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=90",
      members: 1,
      capacity: Number(form.capacity) || 8,
      initials: ["YOU"],
      vibe: form.vibe,
      tags: [form.vibe, "New group", "Open to join"],
      description:
        form.description.trim() ||
        "A new SceneMates crew looking for people who want to share the night.",
      host: "You",
      joined: true,
    };

    setGroups((current) => [newGroup, ...current]);
    setJoinedIds((current) => new Set(current).add(newGroup.id));
    setView("mine");
    setVibe("All");
    setQuery("");
    setCreateOpen(false);
  };

  return (
    <>
      <section className="mx-auto max-w-[1500px] px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a95bf4]">
              Groups in your city
            </p>
            <h1 className="mt-5 max-w-[820px] text-5xl font-medium leading-[0.88] tracking-[-0.055em] text-white sm:text-7xl lg:text-[6.5rem]">
              The night is better with a crew.
            </h1>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-[52ch] text-base leading-8 text-zinc-400">
              Find small groups built around the events you already want to
              attend. Join the plan, meet in chat and arrive together.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-7 flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={17} /> Create a group
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <article className="relative min-h-[480px] overflow-hidden rounded-[22px] bg-zinc-950 sm:min-h-[540px]">
          <Image
            src={featured.cover}
            alt={`${featured.event} crowd`}
            fill
            priority
            sizes="(min-width: 1536px) 1420px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/10" />
          <div className="relative flex min-h-[480px] max-w-[720px] flex-col justify-end p-6 sm:min-h-[540px] sm:p-10 lg:p-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c58aff]">
              Featured crew / {featured.date}
            </p>
            <h2 className="mt-4 text-4xl font-medium leading-[0.9] tracking-[-0.045em] text-white sm:text-6xl">
              {featured.name}
            </h2>
            <p className="mt-5 max-w-[52ch] text-sm leading-7 text-zinc-300 sm:text-base">
              {featured.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[9px] uppercase tracking-[0.13em] text-zinc-300">
              <span className="flex items-center gap-2">
                <MapPin size={13} /> {featured.venue}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={13} /> {featured.date}
              </span>
              <span className="flex items-center gap-2">
                <Users size={13} /> {featured.members} members
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleJoin(featured.id)}
              className={`mt-8 flex h-12 w-fit items-center gap-2 rounded-full px-6 text-sm font-semibold transition-transform active:scale-[0.98] ${
                featuredJoined
                  ? "bg-white text-black"
                  : "bg-[#a95bf4] text-black hover:scale-[1.02]"
              }`}
            >
              {featuredJoined && <Check size={16} />}
              {featuredJoined ? "Joined" : "Join this crew"}
            </button>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex gap-7">
              <button
                type="button"
                onClick={() => setView("discover")}
                className={`text-3xl font-medium tracking-[-0.04em] transition sm:text-5xl ${
                  view === "discover" ? "text-white" : "text-zinc-700 hover:text-zinc-400"
                }`}
              >
                Discover
              </button>
              <button
                type="button"
                onClick={() => setView("mine")}
                className={`text-3xl font-medium tracking-[-0.04em] transition sm:text-5xl ${
                  view === "mine" ? "text-white" : "text-zinc-700 hover:text-zinc-400"
                }`}
              >
                My groups
              </button>
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {filteredGroups.length} groups shown
            </p>
          </div>

          <label className="flex h-12 w-full items-center gap-3 rounded-full border border-white/15 bg-black/45 px-5 text-zinc-400 backdrop-blur-sm lg:max-w-[360px]">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search groups or events"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {groupVibes.map((groupVibe) => (
            <button
              key={groupVibe}
              type="button"
              onClick={() => setVibe(groupVibe)}
              className={`shrink-0 rounded-full px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] transition active:scale-[0.98] ${
                vibe === groupVibe
                  ? "bg-[#a95bf4] text-black"
                  : "border border-white/15 text-zinc-400 hover:border-white/35 hover:text-white"
              }`}
            >
              {groupVibe}
            </button>
          ))}
        </div>

        {filteredGroups.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                joined={joinedIds.has(group.id)}
                onToggleJoin={toggleJoin}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex min-h-[320px] flex-col items-center justify-center rounded-[18px] border border-white/10 bg-black/40 px-6 text-center">
            <Users size={28} className="text-[#a95bf4]" />
            <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] text-white">
              No groups found.
            </h2>
            <p className="mt-3 max-w-[38ch] text-sm leading-6 text-zinc-500">
              Try another search, change the vibe, or create the group you want
              to join.
            </p>
          </div>
        )}
      </section>

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createGroup}
      />
    </>
  );
}
