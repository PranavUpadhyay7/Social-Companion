export default function FeaturedEvent() {
  return (
    <section className="relative mx-auto max-w-[1920px] px-5 pb-8 pt-4 sm:px-8 sm:pb-10 sm:pt-6 lg:px-10">
      <div className="relative min-h-[430px] overflow-hidden sm:min-h-[460px] lg:min-h-[480px]">
        <div className="relative z-10 flex min-h-[430px] items-center sm:min-h-[460px] lg:min-h-[480px]">
          <div className="max-w-3xl">
            <h1 className="scale-y-[1.12] text-[clamp(4.2rem,7.4vw,9rem)] font-bold uppercase leading-[0.78] tracking-[-0.05em] text-white">
              Enter
              <br />
              The Night
            </h1>
            <p className="mt-8 max-w-[260px] font-mono text-[9px] uppercase leading-[1.55] tracking-[0.16em] text-zinc-400 sm:text-[10px]">
              Curated nights.
              <br />
              Real people.
              <br />
              Unforgettable moments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
