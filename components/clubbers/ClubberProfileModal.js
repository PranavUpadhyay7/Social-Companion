"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, MapPin, Music2, Sparkles, X } from "lucide-react";

export default function ClubberProfileModal({ clubber, onClose }) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {clubber && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="clubber-profile-title"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
            className="relative max-h-[92dvh] w-full max-w-[860px] overflow-y-auto rounded-t-[22px] border border-white/10 bg-zinc-950 p-4 shadow-[0_36px_120px_rgba(0,0,0,0.65)] sm:rounded-[22px] sm:p-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${clubber.name}'s profile`}
              className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/85 text-zinc-300 transition hover:text-white active:scale-95"
            >
              <X size={18} />
            </button>

            <div className="grid gap-7 md:grid-cols-[0.92fr_1.08fr] md:items-center">
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[330px] overflow-hidden rounded-2xl bg-zinc-900">
                <Image
                  src={clubber.image}
                  alt={`${clubber.name}'s profile`}
                  fill
                  sizes="(min-width: 768px) 390px, 92vw"
                  unoptimized={clubber.image.startsWith("/api/profile/media/")}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/55 via-transparent to-transparent" />
                {clubber.sharedStatus && (
                  <p className="absolute bottom-4 left-4 rounded-full bg-zinc-950/80 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md">
                    {clubber.sharedStatus === "going" ? "Going to" : "Interested in"}{" "}
                    {clubber.sharedEvent || clubber.event}
                  </p>
                )}
              </div>

              <div className="px-1 pb-2 md:pr-5">
                <p className="text-xs font-medium text-[#c58aff]">
                  {clubber.compatibility}% compatible
                </p>
                <h2
                  id="clubber-profile-title"
                  className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl"
                >
                  {clubber.name}, {clubber.age}
                </h2>
                <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin size={14} /> {clubber.city} · {clubber.distance}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {clubber.gender} · {clubber.pronouns}
                </p>
                <p className="mt-6 text-sm leading-7 text-zinc-300">{clubber.bio}</p>

                <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <dt className="flex items-center gap-2 text-xs font-medium text-[#c58aff]">
                      <Music2 size={14} /> Favourite song
                    </dt>
                    <dd className="mt-2 text-sm leading-5 text-zinc-200">
                      {clubber.favoriteSong}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <dt className="flex items-center gap-2 text-xs font-medium text-[#c58aff]">
                      <Sparkles size={14} /> Nightlife style
                    </dt>
                    <dd className="mt-2 text-sm leading-5 text-zinc-200">
                      {clubber.vibe}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <p className="text-xs font-medium text-zinc-500">Music</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {clubber.music.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium text-zinc-500">Interests</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {clubber.interests.join(", ")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 flex h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-zinc-950 transition hover:bg-[#c58aff] active:scale-[0.98]"
                >
                  <Heart size={15} /> Back to swiping
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
