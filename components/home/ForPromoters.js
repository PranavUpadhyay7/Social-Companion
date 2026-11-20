import Link from "next/link";

export default function ForPromoters() {
  return (
    <section
      aria-labelledby="for-promoters-heading"
      className="relative z-10 border-y border-white/10 bg-black/60 px-6 py-10 text-white"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#a95bf4]">For promoters</p>
          <h2 id="for-promoters-heading" className="mt-2 text-2xl tracking-[-0.03em] md:text-3xl">
            Run your night on SceneMates.
          </h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-6 text-zinc-400">
            Publish events, manage your guest list and check guests in at the door, all in one place.
          </p>
        </div>
        <Link
          href="/promoter"
          className="inline-flex min-h-11 shrink-0 items-center justify-center bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Open promoter studio
        </Link>
      </div>
    </section>
  );
}
