import SideRays from "@/components/effects/SideRays";
import SwipeDeck from "@/components/clubbers/SwipeDeck";

export default function ClubbersPage() {
  return (
    <main className="relative min-h-[calc(100dvh-5rem)] overflow-hidden px-4 pb-16 pt-7 text-white sm:px-8 sm:pt-10 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <SideRays
          origin="top-right"
          speed={2.5}
          rayColor1="#ffffff"
          rayColor2="#a95bf4"
          intensity={2.5}
          spread={1.2}
          tilt={-35}
          saturation={1.5}
          blend={0.75}
          falloff={0.5}
          opacity={1}
        />
      </div>
      <div className="mx-auto mb-8 max-w-[1100px] text-center xl:hidden">
        <h1 className="text-4xl font-medium tracking-[-0.05em] text-white sm:text-5xl">
          Find someone on your wavelength.
        </h1>
        <p className="mx-auto mt-4 max-w-[46ch] text-sm leading-6 text-zinc-400">
          Meet people interested in the same events and make your next night a
          shared one.
        </p>
      </div>
      <SwipeDeck />
    </main>
  );
}
