"use client";

import FlowArt, { FlowSection } from "@/components/ui/story-scroll";

const chapters = [
  {
    number: "01",
    label: "What we do",
    title: ["Find your people.", "Pick your party."],
    description:
      "SceneMates brings nightlife discovery and social matching into one place. Find the right event, meet people who share your vibe, and make plans before the night begins.",
    details: ["Nightlife discovery", "Social matching", "Shared plans"],
    background: "#0d0d0e",
    tone: "dark",
  },
  {
    number: "02",
    label: "Discover",
    title: ["Know where", "to go."],
    description:
      "Explore club nights, DJ sets, concerts and parties around your city. Filter by date, price and category so the events you see fit the night you actually want.",
    details: ["City-based events", "Personal filters", "Curated nights"],
    background: "#f2f2ef",
    tone: "light",
  },
  {
    number: "03",
    label: "Connect",
    title: ["See who's", "going."],
    description:
      "Show interest in an event and discover other clubbers considering the same night. Compare music taste, party preferences and shared interests before deciding who to meet.",
    details: ["Attendee discovery", "Shared music taste", "Nightlife preferences"],
    background: "#0d0d0e",
    tone: "dark",
  },
  {
    number: "04",
    label: "Match",
    title: ["Turn interest", "into a plan."],
    description:
      "Swipe through relevant people, match when the interest is mutual, and start a private conversation. Every connection begins with a real event already in common.",
    details: ["Mutual matching", "Private chat", "Event in common"],
    background: "#f2f2ef",
    tone: "light",
  },
  {
    number: "05",
    label: "Community",
    title: ["Meet the crew", "before the night."],
    description:
      "Join the event group chat, bring friends into the plan, or build a new group around the same party. Arrive with familiar names instead of walking into a room alone.",
    details: ["Event group chat", "Create a crew", "Plan together"],
    background: "#0d0d0e",
    tone: "dark",
  },
  {
    number: "06",
    label: "Book",
    title: ["One plan.", "One place."],
    description:
      "Buy tickets, reserve tables and review club offers without leaving the experience. Clubs and promoters can publish events while every guest keeps their social plan connected.",
    details: ["Tickets", "VIP tables", "Club offers"],
    background: "#f2f2ef",
    tone: "light",
  },
  {
    number: "07",
    label: "Go together",
    title: ["Make the night", "yours."],
    description:
      "SceneMates takes you from discovering a party to knowing who will be there. Less uncertainty, better connections, and more nights that begin with the right people.",
    details: ["Discover", "Match", "Chat", "Book", "Go together"],
    background: "#0d0d0e",
    tone: "dark",
  },
];

function ChapterIndex({ active, dark }) {
  return (
    <p
      className={`font-mono text-[10px] uppercase tracking-[0.2em] ${dark ? "text-white/40" : "text-black/35"}`}
      aria-label={`Slide ${active + 1} of ${chapters.length}`}
    >
      {chapters.map((chapter, index) => (
        <span
          key={chapter.number}
          className={
            index === active
              ? dark
                ? "text-[#c58aff]"
                : "text-[#7626ad]"
              : undefined
          }
        >
          {index > 0 ? "  /  " : ""}
          {chapter.number}
        </span>
      ))}
    </p>
  );
}

export default function HowItWorks() {
  return (
    <section className="relative bg-transparent py-20 text-white sm:py-28">
      <div className="mx-auto w-[calc(100%-2rem)] max-w-[1280px] pb-12 sm:w-[calc(100%-5rem)] sm:pb-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a95bf4]">
          How SceneMates works
        </p>
        <h2 className="mt-5 max-w-[820px] text-4xl font-medium uppercase leading-[1.02] tracking-[-0.025em] [word-spacing:0.08em] sm:text-6xl lg:text-7xl">
          One journey from discovery to the dance floor.
        </h2>
      </div>

      <FlowArt aria-label="How SceneMates works">
        {chapters.map((chapter, index) => {
          const dark = chapter.tone === "dark";

          return (
          <FlowSection
            key={chapter.number}
            aria-label={`${chapter.number} ${chapter.label}`}
            className="flex items-center bg-transparent py-8 sm:py-12"
            innerClassName={`mx-auto min-h-[calc(100dvh-4rem)] w-[calc(100%-2rem)] max-w-[1280px] overflow-hidden rounded-[20px] px-6 py-8 shadow-[0_28px_90px_rgba(84,31,120,0.38)] sm:min-h-[calc(100dvh-6rem)] sm:w-[calc(100%-5rem)] sm:px-10 sm:py-10 lg:px-14 lg:py-12 ${dark ? "text-white" : "text-black"}`}
            style={{ backgroundColor: chapter.background }}
          >
            <article className="flex w-full flex-col justify-between [font-family:var(--font-manrope)]">
              <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.16em] ${dark ? "text-[#c58aff]" : "text-[#7626ad]"}`}
                >
                  {chapter.number} / {chapter.label}
                </p>
                <ChapterIndex active={index} dark={dark} />
              </header>

              <div className="my-auto grid items-stretch gap-8 py-10 sm:py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                <div
                  className={`flex min-h-[330px] flex-col justify-between rounded-[22px] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:min-h-[420px] sm:p-9 ${dark ? "bg-white text-black" : "bg-black text-white"}`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.15em] ${dark ? "text-[#7626ad]" : "text-[#c58aff]"}`}
                  >
                    The SceneMates way
                  </p>

                  <div className="space-y-5">
                    {chapter.details.map((detail, detailIndex) => (
                      <p
                        key={detail}
                        className="flex items-baseline gap-5 text-base font-semibold tracking-[-0.02em] sm:text-lg"
                      >
                        <span
                          className={`text-xs font-bold ${dark ? "text-[#7626ad]" : "text-[#c58aff]"}`}
                        >
                          {String(detailIndex + 1).padStart(2, "0")}
                        </span>
                        {detail}
                      </p>
                    ))}
                  </div>

                  <p
                    className={`text-6xl font-semibold tracking-[-0.07em] sm:text-8xl ${dark ? "text-black" : "text-white"}`}
                  >
                    {chapter.number}
                  </p>
                </div>

                <div className="flex flex-col justify-center py-2 sm:py-6">
                  <h3
                    className={`max-w-[760px] text-[clamp(3.8rem,7.3vw,7.4rem)] font-medium leading-[0.86] tracking-[-0.045em] [font-family:var(--font-cormorant)] ${dark ? "text-white" : "text-black"}`}
                  >
                    {chapter.title.map((line, lineIndex) => (
                      <span
                        key={line}
                        className={`block pb-[0.08em] ${lineIndex === 1 ? `italic ${dark ? "text-[#c58aff]" : "text-[#7626ad]"}` : ""}`}
                      >
                        {line}
                      </span>
                    ))}
                  </h3>
                  <p
                    className={`mt-8 max-w-[54ch] text-base leading-8 tracking-[-0.01em] sm:text-lg sm:leading-9 ${dark ? "text-white/78" : "text-black/70"}`}
                  >
                    {chapter.description}
                  </p>
                </div>
              </div>

              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${dark ? "text-[#c58aff]/75" : "text-[#7626ad]/75"}`}
              >
                Nightlife discovery / People with your vibe / Plans that become real
              </p>
            </article>
          </FlowSection>
          );
        })}
      </FlowArt>
    </section>
  );
}
