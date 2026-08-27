"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronDown, MapPin, UserRound } from "lucide-react";

function ProfileMedia({ item, name, active }) {
  if (item.type === "video") {
    return (
      <video
        src={item.src}
        aria-label={item.alt || `${name}'s uploaded video`}
        autoPlay={active}
        muted
        loop
        playsInline
        preload="metadata"
        className="pointer-events-none h-full w-full select-none object-cover"
      />
    );
  }

  return (
    <Image
      src={item.src}
      alt={item.alt || `${name}'s uploaded photo`}
      fill
      priority={active}
      sizes="(min-width: 1024px) 430px, 92vw"
      unoptimized={item.src.startsWith("/api/profile/media/")}
      className="pointer-events-none select-none object-cover"
    />
  );
}

export default function ClubberCard({
  clubber,
  onSwipe,
  onViewProfile,
  reducedMotion,
}) {
  const media = clubber.media?.length
    ? clubber.media.slice(0, 5)
    : [
        {
          id: `${clubber.id}-profile`,
          type: "image",
          src: clubber.image,
          alt: `${clubber.name}'s profile photo`,
        },
      ];
  const mediaScroller = useRef(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-9, 9]);
  const likeOpacity = useTransform(x, [35, 135], [0, 1]);
  const passOpacity = useTransform(x, [-135, -35], [1, 0]);

  useEffect(() => {
    setActiveMediaIndex(0);
    mediaScroller.current?.scrollTo({ top: 0 });
  }, [clubber.id]);

  const goToMedia = (mediaIndex) => {
    const scroller = mediaScroller.current;
    if (!scroller) return;
    scroller.scrollTo({
      top: scroller.clientHeight * mediaIndex,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

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
      <div
        ref={mediaScroller}
        onScroll={(event) => {
          const { clientHeight, scrollTop } = event.currentTarget;
          if (!clientHeight) return;
          setActiveMediaIndex(
            Math.min(media.length - 1, Math.round(scrollTop / clientHeight)),
          );
        }}
        className="absolute inset-0 z-0 overflow-y-auto overscroll-contain scroll-smooth snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {media.map((item, mediaIndex) => (
          <div
            key={item.id || `${clubber.id}-${mediaIndex}`}
            className="relative h-full w-full snap-start snap-always overflow-hidden"
          >
            <ProfileMedia
              item={item}
              name={clubber.name}
              active={activeMediaIndex === mediaIndex}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/5 to-black/20" />

      {media.length > 1 && (
        <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2" aria-label="Profile media">
          {media.map((item, mediaIndex) => (
            <button
              key={item.id || `media-control-${mediaIndex}`}
              type="button"
              aria-label={`View upload ${mediaIndex + 1} of ${media.length}`}
              aria-current={activeMediaIndex === mediaIndex ? "true" : undefined}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                goToMedia(mediaIndex);
              }}
              className={`h-7 w-1 rounded-full transition-all ${
                activeMediaIndex === mediaIndex
                  ? "bg-[#c58aff]"
                  : "bg-white/35 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label={`View ${clubber.name}'s full profile`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onViewProfile(clubber);
        }}
        className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white backdrop-blur-md transition hover:border-[#c58aff] hover:text-[#d9b5ff] active:scale-95"
      >
        <UserRound size={18} />
      </button>

      <motion.p
        style={{ opacity: likeOpacity }}
        className="absolute left-5 top-5 z-20 rotate-[-7deg] border-2 border-[#c58aff] px-4 py-2 font-mono text-lg font-bold uppercase tracking-[0.16em] text-[#c58aff]"
      >
        Your vibe
      </motion.p>
      <motion.p
        style={{ opacity: passOpacity }}
        className="absolute right-5 top-20 z-20 rotate-[7deg] border-2 border-white/80 px-4 py-2 font-mono text-lg font-bold uppercase tracking-[0.16em] text-white"
      >
        Next
      </motion.p>

      {media.length > 1 && activeMediaIndex === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-white/75">
          <span className="font-mono text-[8px] uppercase tracking-[0.16em]">
            Swipe down · {media.length} uploads
          </span>
          <ChevronDown size={14} className="animate-bounce" aria-hidden="true" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c58aff]">
            {clubber.compatibility}% compatible
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-300">
            {clubber.sharedEventDate || clubber.eventDate}
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
              {clubber.sharedStatus === "going" ? "Going to" : "Interested in"}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {clubber.sharedEvent || clubber.event}
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
