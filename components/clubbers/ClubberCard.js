"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";

export default function ClubberCard({ clubber, onSwipe, reducedMotion }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-9, 9]);
  const likeOpacity = useTransform(x, [35, 135], [0, 1]);
  const passOpacity = useTransform(x, [-135, -35], [1, 0]);

  return (
    <motion.article
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 115 || info.velocity.x > 650) onSwipe(1);
        if (info.offset.x < -115 || info.velocity.x < -650) onSwipe(-1);
      }}
      style={{ x, rotate: reducedMotion ? 0 : rotate }}
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 210, damping: 24 }}
      className="group absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-[22px] bg-zinc-950 shadow-[0_34px_100px_rgba(50,10,72,0.52)] active:cursor-grabbing"
    >
      <Image
        src={clubber.image}
        alt={`${clubber.name}'s profile`}
        fill
        priority
        sizes="(min-width: 1024px) 430px, 92vw"
        className="pointer-events-none select-none object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/10" />

      <motion.p
        style={{ opacity: likeOpacity }}
        className="absolute left-5 top-5 rotate-[-7deg] border-2 border-[#c58aff] px-4 py-2 font-mono text-lg font-bold uppercase tracking-[0.16em] text-[#c58aff]"
      >
        Your vibe
      </motion.p>
      <motion.p
        style={{ opacity: passOpacity }}
        className="absolute right-5 top-5 rotate-[7deg] border-2 border-white/80 px-4 py-2 font-mono text-lg font-bold uppercase tracking-[0.16em] text-white"
      >
        Next
      </motion.p>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c58aff]">
            {clubber.compatibility}% compatible
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-300">
            {clubber.eventDate}
          </p>
        </div>

        <h2 className="text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
          {clubber.name}, {clubber.age}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
          <MapPin size={14} /> {clubber.city} · {clubber.distance}
        </p>
        <p className="mt-5 line-clamp-2 max-w-[38ch] text-sm leading-6 text-zinc-200">
          {clubber.bio}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-500">
              Interested in
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {clubber.event}
            </p>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
            {clubber.pronouns}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
