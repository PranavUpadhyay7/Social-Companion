"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function FilterDrawer({
  open,
  onClose,
  filters,
  onApply,
  getResultCount,
}) {
  const [draftFilters, setDraftFilters] = useState(filters);

  const dateOptions = [
    "Anytime",
    "Today",
    "Tomorrow",
    "This Weekend",
    "This Week",
  ];

  const priceOptions = ["Any Price", "Free", "Paid", "Under $25", "Under $100"];

  useEffect(() => {
    if (open) setDraftFilters(filters);
  }, [filters, open]);

  const resultCount = getResultCount(draftFilters);

  if (!open) return null;

  const clearFilters = () => {
    const cleared = { date: "Anytime", price: "Any Price", distance: 50 };
    setDraftFilters(cleared);
    onApply(cleared);
  };

  const updateFilter = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    onApply(draftFilters);
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[3px]"
      />

      {/* DRAWER */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[500px] flex-col border-l border-zinc-800 bg-black shadow-[-20px_0_80px_rgba(0,0,0,0.7)]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5 sm:px-7 sm:py-6">
          <h2 className="font-mono text-base uppercase tracking-[0.14em] text-white">
            Filters
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-white"
          >
            <X size={23} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-7 sm:px-7 sm:py-8">
          {/* DATE */}
          <div>
            <p className="mb-4 text-sm font-semibold text-gray-200">Date</p>

            <div className="flex flex-wrap gap-2">
              {dateOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => updateFilter("date", item)}
                  className={`border px-4 py-3 font-mono text-xs uppercase tracking-wide transition ${
                    draftFilters.date === item
                      ? "border-white bg-white text-[#2e2e2e] shadow-[0_0_10px_#a95bf4]"
                      : "border-zinc-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="mt-11">
            <p className="mb-4 text-sm font-semibold text-gray-200">Price</p>

            <div className="flex flex-wrap gap-2">
              {priceOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => updateFilter("price", item)}
                  className={`border px-4 py-3 font-mono text-xs uppercase tracking-wide transition ${
                    draftFilters.price === item
                      ? "border-white bg-white text-[#2e2e2e] shadow-[0_0_10px_#a95bf4]"
                      : "border-zinc-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* DISTANCE */}
          <div className="mt-11">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-200">Distance</p>

              <span className="text-sm font-semibold text-[#a95bf4]">
                {draftFilters.distance} miles
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={draftFilters.distance}
              onChange={(event) => updateFilter("distance", event.target.value)}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#a95bf4] accent-[#a95bf4]"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] px-5 py-5 sm:px-7 sm:py-6">
          <button
            onClick={clearFilters}
            className="font-mono text-xs uppercase tracking-wider text-gray-400 transition hover:text-white"
          >
            Clear All
          </button>

          <button
            onClick={applyFilters}
            className="bg-white px-4 py-3 font-mono text-[10px] font-black uppercase tracking-widest text-[#2e2e2e] transition hover:shadow-[0_0_6px_#a95bf4,0_0_10px_#a95bf4] sm:px-6 sm:text-xs"
          >
            Show {resultCount} {resultCount === 1 ? "Event" : "Events"}
          </button>
        </div>
      </aside>
    </>
  );
}
