"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const productStories = [
  {
    word: "Discover",
    title: "Discover your city",
    description:
      "Browse club nights, DJ sets, concerts and parties by city, date and vibe. Save the events that feel right and see where your crowd is heading.",
    background:
      "linear-gradient(145deg, rgba(169, 91, 244, 0.13), transparent 42%), #111115",
  },
  {
    word: "See",
    title: "See who's going",
    description:
      "See who has already booked and who is still interested before you decide. Shared attendance makes it easier to find compatible people with similar plans.",
    background:
      "linear-gradient(160deg, rgba(169, 91, 244, 0.08), transparent 48%), #151419",
  },
  {
    word: "Meet",
    title: "Meet your crowd",
    description:
      "Profiles are prioritised around the events you share, followed by music taste and nightlife preferences. The most relevant people appear before unrelated profiles.",
    background:
      "linear-gradient(125deg, rgba(169, 91, 244, 0.12), transparent 45%), #101014",
  },
  {
    word: "Match",
    title: "Match before the night",
    description:
      "Swipe through people connected to the same nights and match when interest is mutual. Start a private conversation and decide whether you want to meet.",
    background:
      "linear-gradient(150deg, rgba(169, 91, 244, 0.15), transparent 46%), #161319",
  },
  {
    word: "Book",
    title: "Book and join the chat",
    description:
      "Buy a ticket or reserve a table without leaving the experience. Once payment is confirmed, the event group chat opens automatically with everyone else attending.",
    background:
      "linear-gradient(155deg, rgba(169, 91, 244, 0.12), transparent 44%), #141217",
  },
  {
    word: "Together",
    title: "Go together",
    description:
      "Use private chats and the event community to settle plans before the doors open. Turn up knowing names, meeting points and people you already want to see.",
    background:
      "linear-gradient(135deg, rgba(169, 91, 244, 0.09), transparent 42%), #101013",
  },
];

function StoryDetails({ story, compact = false }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-[2] p-5 sm:p-7">
      <h3
        className={`max-w-[16ch] font-medium leading-[0.98] tracking-[-0.045em] text-white ${
          compact ? "text-3xl" : "text-3xl lg:text-[2.75rem]"
        }`}
      >
        {story.title}
      </h3>
      <p className="mt-4 max-w-[38ch] text-sm leading-6 text-zinc-300">
        {story.description}
      </p>
    </div>
  );
}

function StoryBackdrop({ story, active, reducedMotion }) {
  const isLongWord = story.word.length > 6;

  return (
    <>
      <div className="absolute inset-0" style={{ background: story.background }} />
      <motion.p
        aria-hidden="true"
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
        transition={{
          duration: reducedMotion ? 0 : 0.24,
          delay: reducedMotion || !active ? 0 : 0.18,
        }}
        className={`absolute left-5 top-5 max-w-[calc(100%-2.5rem)] whitespace-nowrap font-medium uppercase leading-none tracking-[-0.065em] text-white/[0.06] blur-[0.35px] ${
          isLongWord
            ? "text-[clamp(3.25rem,5.8vw,6.5rem)]"
            : "text-[clamp(4rem,7vw,7.5rem)]"
        }`}
      >
        {story.word}
      </motion.p>
      <motion.p
        aria-hidden="true"
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.12 }}
        className={`absolute left-3 top-5 max-w-[calc(100%-1.5rem)] overflow-hidden text-ellipsis whitespace-nowrap font-medium uppercase leading-none tracking-[-0.035em] text-white/[0.055] blur-[0.25px] ${
          isLongWord ? "text-[clamp(0.8rem,1.3vw,1.2rem)]" : "text-[clamp(1.15rem,1.8vw,1.8rem)]"
        }`}
      >
        {story.word}
      </motion.p>
      <div className="absolute inset-y-0 left-0 w-px bg-[#a95bf4]/50" />
    </>
  );
}

export default function HoverFeaturedEvents() {
  const [activeIndex, setActiveIndex] = useState(1);
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hover-featured-title"
      className="relative overflow-hidden px-5 pb-16 pt-24 text-white sm:px-8 sm:pb-24 sm:pt-32 lg:px-10"
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-[1500px]"
      >
        <h2
          id="hover-featured-title"
          className="max-w-[760px] text-4xl font-medium uppercase leading-[0.95] tracking-[-0.055em] text-zinc-100 sm:text-6xl lg:text-7xl"
        >
          More than a ticketing app.
        </h2>
        <p className="mt-5 max-w-[54ch] text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
          SceneMates connects event discovery, social matching and booking in one
          nightlife platform.
        </p>

        <div className="mt-10 hidden h-[440px] w-full gap-2 lg:mt-14 lg:flex lg:h-[500px]">
          {productStories.map((story, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.button
                layout={!reducedMotion}
                key={story.title}
                type="button"
                onHoverStart={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                aria-label={`${story.title}: ${story.description}`}
                className={`group relative min-w-0 cursor-pointer overflow-hidden border text-left outline-none transition-colors focus-visible:border-[#c58aff] ${
                  isActive
                    ? "flex-[4] border-white/25"
                    : "flex-1 border-white/10 hover:border-white/25"
                }`}
                transition={{
                  layout: reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 240, damping: 30 },
                }}
              >
                <StoryBackdrop
                  story={story}
                  active={isActive}
                  reducedMotion={reducedMotion}
                />

                <motion.div
                  className="absolute inset-0 z-[2]"
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 10,
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.2,
                    delay: reducedMotion || !isActive ? 0 : 0.2,
                  }}
                  aria-hidden={!isActive}
                >
                  <StoryDetails story={story} />
                </motion.div>

                <motion.p
                  initial={false}
                  animate={{ opacity: isActive ? 0 : 1 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.12,
                    delay: reducedMotion || isActive ? 0 : 0.1,
                  }}
                  aria-hidden={isActive}
                  className="absolute bottom-5 left-3 right-2 z-[2] overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-300"
                >
                  {story.word}
                </motion.p>
              </motion.button>
            );
          })}
        </div>

        <div className="-mx-5 mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden">
          {productStories.map((story) => (
            <article
              key={story.title}
              className="relative h-[430px] w-[78vw] max-w-[360px] shrink-0 snap-center overflow-hidden border border-white/15"
            >
              <StoryBackdrop story={story} active reducedMotion={reducedMotion} />
              <StoryDetails story={story} compact />
            </article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
