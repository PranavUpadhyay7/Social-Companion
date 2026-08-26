"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Music2,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { clubbers } from "@/data/clubbers";
import ClubberCard from "./ClubberCard";
import MatchModal from "./MatchModal";

export default function SwipeDeck() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lastIndex, setLastIndex] = useState(null);
  const [match, setMatch] = useState(null);
  const reducedMotion = useReducedMotion();
  const current = clubbers[index];

  const swipe = useCallback(
    (nextDirection) => {
      if (!current || match) return;
      setDirection(nextDirection);
      setLastIndex(index);
      if (nextDirection > 0 && current.willMatch) setMatch(current);
      setIndex((value) => value + 1);
    },
    [current, index, match],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && match) setMatch(null);
      if (match) return;
      if (event.key === "ArrowLeft") swipe(-1);
      if (event.key === "ArrowRight") swipe(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [match, swipe]);

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
      <div className="grid w-full gap-8 xl:grid-cols-[280px_minmax(360px,470px)_300px] xl:items-center xl:justify-center xl:gap-10">
        <aside className="hidden xl:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a95bf4]">
            Your nightlife circle
          </p>
          <h1 className="mt-5 text-5xl font-medium leading-[0.9] tracking-[-0.05em] text-white">
            Find someone on your wavelength.
          </h1>
          <p className="mt-6 text-sm leading-7 text-zinc-400">
            Every profile is connected to an event you both care about. Swipe
            right to connect or left to keep exploring.
          </p>
          <div className="mt-9 space-y-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            <p>Right arrow / Interested</p>
            <p>Left arrow / Next profile</p>
          </div>
        </aside>

        <section aria-label="Clubber profiles" className="mx-auto w-full max-w-[470px]">
          <div className="mb-5 flex items-end justify-between px-1">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a95bf4] xl:hidden">
                Clubbers
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {current ? `${clubbers.length - index} people nearby` : "You're all caught up"}
              </p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              {String(Math.min(index + 1, clubbers.length)).padStart(2, "0")} / {String(clubbers.length).padStart(2, "0")}
            </p>
          </div>

          <div className="relative aspect-[4/5.65] w-full">
            {clubbers[index + 2] && (
              <div className="absolute inset-x-6 inset-y-3 rounded-[22px] bg-zinc-900 opacity-45" />
            )}
            {clubbers[index + 1] && (
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

        <aside className="mx-auto w-full max-w-[470px] rounded-[20px] border border-white/10 bg-black/45 p-6 backdrop-blur-sm xl:mx-0 xl:max-w-none">
          {current ? (
            <>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  Why you match
                </p>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[#c58aff]">
                  {current.compatibility}%
                </p>
              </div>
              <div className="mt-7 space-y-7">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                    <Music2 size={14} className="text-[#a95bf4]" /> Music
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {current.music.join(" · ")}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                    <Users size={14} className="text-[#a95bf4]" /> Nightlife vibe
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {current.vibe}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">
                    <MessageCircle size={14} className="text-[#a95bf4]" /> Interests
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {current.interests.join(" · ")}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm leading-6 text-zinc-500">
                Your next recommendations will appear here.
              </p>
            </div>
          )}
        </aside>
      </div>

      <MatchModal clubber={match} onClose={() => setMatch(null)} />
    </>
  );
}
