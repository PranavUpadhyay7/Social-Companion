"use client";

import React from "react";
import { GlassButton } from "@/components/ui/glass-button";

const destinations = [
  {
    title: "Events",
    href: "/events",
    description:
      "Discover upcoming parties, club nights and exclusive events near you.",
  },
  {
    title: "Clubbers",
    href: "/clubbers",
    description:
      "Meet people who share your vibe and build your nightlife network.",
  },
  {
    title: "Groups",
    href: "/groups",
    description:
      "Join existing groups or create your own crew for unforgettable nights.",
  },
];

const Front = () => {
  return (
    <div>
      {/* Heading */}
      <div className="w-full flex justify-center px-4 pt-16 md:pt-20 lg:pt-[120px] pb-8 md:pb-16 lg:pb-20">
        <h1 className="text-white scale-y-[1.2] text-[7vw] leading-[0.8] font-bold text-center font-stretch-expanded">
          DISCOVER YOUR
          <br />
          NIGHTLIFE CREW
        </h1>
      </div>

      {/* Subtitle */}
      <div className="text-[1.5vw]">
        <h2 className="text-gray-400 text-center text-wrap">
          Join epic parties, connect with clubbers, and match with groups around
          you.
        </h2>
      </div>

      {/* Buttons */}
      <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] grid-cols-1 gap-6 py-20 md:grid-cols-3">
        {destinations.map((destination) => (
          <div
            key={destination.href}
            className="flex min-h-[190px] flex-col items-start px-2 py-3 text-left sm:px-4"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a95bf4]">
              Explore
            </span>
            <p className="mb-7 mt-5 max-w-[280px] text-sm leading-6 text-zinc-400">
              {destination.description}
            </p>
            <GlassButton
              href={destination.href}
              size="lg"
              className="mt-auto w-full"
              contentClassName="flex w-full items-center justify-center font-mono text-xs font-semibold uppercase tracking-[0.15em]"
              aria-label={`Explore ${destination.title}`}
            >
              {destination.title}
            </GlassButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Front;
