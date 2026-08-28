import { events } from "@/data/events";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";

const slides = events.map((event) => ({
  id: event.id,
  src: event.image,
  alt: `${event.shortTitle} at ${event.venue}`,
  kicker: `${event.date} / ${event.category}`,
  title: event.shortTitle,
  subtitle: event.title,
  meta: [
    { label: "Venue", value: event.venue.split(",")[0] },
    { label: "From", value: event.price },
    { label: "Away", value: `${event.distance} km` },
  ],
}));

export default function NightCoverflow() {
  return (
    <section
      aria-labelledby="night-coverflow-title"
      className="relative overflow-hidden py-20 text-white sm:py-28"
    >
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1400px] sm:w-[calc(100%-5rem)]">
        <div className="max-w-[760px]">
          <h2
            id="night-coverflow-title"
            className="text-4xl font-medium uppercase leading-[0.96] tracking-[-0.05em] text-zinc-100 sm:text-6xl lg:text-7xl"
          >
            Nights already in motion.
          </h2>
          <p className="mt-5 max-w-[58ch] text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
            Drag through the city&apos;s next nights. Each event is a place to
            discover the crowd, show interest and turn a shared plan into
            something real.
          </p>
        </div>

        <div className="mt-8 border-y border-white/10 py-2 sm:mt-12 sm:py-4">
          <CoverflowCarousel slides={slides} />
        </div>
      </div>
    </section>
  );
}
