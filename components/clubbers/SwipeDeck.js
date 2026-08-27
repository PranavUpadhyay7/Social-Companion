"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, RotateCcw, Users, X } from "lucide-react";
import { clubbers as trialClubbers } from "@/data/clubbers";
import { events } from "@/data/events";
import { useEventActivity } from "@/components/social/EventActivityProvider";
import ClubberCard from "./ClubberCard";
import ClubberProfileModal from "./ClubberProfileModal";
import MatchModal from "./MatchModal";

export default function SwipeDeck({ onMatch, onMatchChat }) {
  const { activity } = useEventActivity();
  const [availableClubbers, setAvailableClubbers] = useState(trialClubbers);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lastIndex, setLastIndex] = useState(null);
  const [match, setMatch] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const reducedMotion = useReducedMotion();

  const loadClubbers = useCallback(async () => {
    try {
      const response = await fetch("/api/clubbers/discover", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) return;
      setAvailableClubbers(payload.clubbers || []);
      setIndex(0);
      setLastIndex(null);
    } catch {
      // Keep the bundled trial profiles available when the API is offline.
    }
  }, []);

  useEffect(() => {
    loadClubbers();
    window.addEventListener("scenemates:matches-updated", loadClubbers);
    return () =>
      window.removeEventListener("scenemates:matches-updated", loadClubbers);
  }, [loadClubbers]);

  const orderedClubbers = useMemo(() => {
    const eventLookup = new Map(events.map((event) => [event.id, event]));

    return availableClubbers
      .map((clubber) => {
        const sharedEvents = (clubber.events || []).filter(
          (entry) => activity[entry.eventId],
        );
        const strongestSharedEvent =
          sharedEvents.find((entry) => entry.status === "going") ||
          sharedEvents.find((entry) => entry.status === "interested");
        const sharedEvent = strongestSharedEvent
          ? eventLookup.get(strongestSharedEvent.eventId)
          : null;

        return {
          ...clubber,
          sharedEvent: sharedEvent?.shortTitle || sharedEvent?.title || null,
          sharedEventDate: sharedEvent?.date || null,
          sharedStatus: strongestSharedEvent?.status || null,
        };
      })
      .sort((a, b) => {
        const priority = { going: 0, interested: 1 };
        const statusDifference =
          (priority[a.sharedStatus] ?? 2) - (priority[b.sharedStatus] ?? 2);
        return statusDifference || b.compatibility - a.compatibility;
      });
  }, [activity, availableClubbers]);
  const current = orderedClubbers[index];

  const swipe = useCallback(
    (nextDirection) => {
      if (!current || match || viewingProfile) return;
      setDirection(nextDirection);
      setLastIndex(index);
      if (nextDirection > 0 && current.willMatch) {
        onMatch?.(current);
        setMatch(current);
      }
      setIndex((value) => value + 1);
    },
    [current, index, match, onMatch, viewingProfile],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && match) setMatch(null);
      if (event.key === "Escape" && viewingProfile) setViewingProfile(null);
      if (match || viewingProfile) return;
      if (event.key === "ArrowLeft") swipe(-1);
      if (event.key === "ArrowRight") swipe(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [match, swipe, viewingProfile]);

  const undo = () => {
    if (lastIndex === null || match) return;
    setIndex(lastIndex);
    setLastIndex(null);
  };

  const restart = () => {
    setIndex(0);
    setLastIndex(null);
    setMatch(null);
  };

  return (
    <>
      <div className="flex w-full justify-center">
        <section aria-label="Clubber profiles" className="mx-auto w-full max-w-[470px]">
          <div className="mb-5 flex items-end justify-between px-1">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a95bf4] xl:hidden">
                Clubbers
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {current ? `${orderedClubbers.length - index} people nearby` : "You're all caught up"}
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              {String(Math.min(index + 1, orderedClubbers.length)).padStart(2, "0")} / {String(orderedClubbers.length).padStart(2, "0")}
            </p>
          </div>

          <div className="relative aspect-[4/5.65] w-full">
            {orderedClubbers[index + 2] && (
              <div className="absolute inset-x-6 inset-y-3 rounded-[22px] bg-zinc-900 opacity-45" />
            )}
            {orderedClubbers[index + 1] && (
              <div className="absolute inset-x-3 inset-y-1.5 rounded-[22px] bg-zinc-800 opacity-75" />
            )}

            <AnimatePresence custom={direction} mode="popLayout">
              {current ? (
                <motion.div
                  key={current.id}
                  custom={direction}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : {
                          x: direction * 650,
                          rotate: direction * 13,
                          opacity: 0,
                        }
                  }
                  transition={{ duration: reducedMotion ? 0.12 : 0.32 }}
                  className="absolute inset-0"
                >
                  <ClubberCard
                    clubber={current}
                    onSwipe={swipe}
                    onViewProfile={setViewingProfile}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] border border-white/10 bg-zinc-950 px-8 text-center"
                >
                  <Users size={30} className="text-[#a95bf4]" />
                  <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-white">
                    You&apos;re caught up.
                  </h2>
                  <p className="mt-4 max-w-[34ch] text-sm leading-6 text-zinc-400">
                    New people appear as they show interest in your events.
                  </p>
                  <button
                    type="button"
                    onClick={restart}
                    className="mt-7 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform active:scale-[0.98]"
                  >
                    <RotateCcw size={16} /> Start again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Undo last swipe"
              onClick={undo}
              disabled={lastIndex === null || Boolean(match)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-zinc-400 transition hover:border-white/40 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <RotateCcw size={17} />
            </button>
            <button
              type="button"
              aria-label="Pass on this profile"
              onClick={() => swipe(-1)}
              disabled={!current || Boolean(match)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-[0_14px_40px_rgba(255,255,255,0.12)] transition hover:scale-105 active:scale-95 disabled:opacity-30"
            >
              <X size={25} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              aria-label="Like this profile"
              onClick={() => swipe(1)}
              disabled={!current || Boolean(match)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#a95bf4] text-black shadow-[0_14px_45px_rgba(169,91,244,0.35)] transition hover:scale-105 active:scale-95 disabled:opacity-30"
            >
              <Heart size={24} fill="currentColor" strokeWidth={1.8} />
            </button>
          </div>
        </section>

      </div>

      <MatchModal
        clubber={match}
        onClose={() => setMatch(null)}
        onStartChat={(clubber) => {
          onMatchChat?.(clubber);
          setMatch(null);
        }}
      />
      <ClubberProfileModal
        clubber={viewingProfile}
        onClose={() => setViewingProfile(null)}
      />
    </>
  );
}
