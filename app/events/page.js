"use client";

import { useMemo, useState } from "react";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import EventGrid from "@/components/events/EventGrid";
import FilterDrawer from "@/components/events/FilterDrawer";
import SideRays from "@/components/effects/SideRays";
import { events } from "@/data/events";

function filterEvents(filters) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  const weekendStart = new Date(today);
  weekendStart.setDate(today.getDate() + daysUntilSaturday);
  const weekendEnd = new Date(weekendStart);
  weekendEnd.setDate(weekendStart.getDate() + 1);

  return events.filter((event) => {
    const eventDate = new Date(`${event.dateISO}T00:00:00`);
    const price = Number(event.price.replace(/[^0-9.]/g, "")) || 0;

    const matchesDate =
      filters.date === "Anytime" ||
      (filters.date === "Today" && eventDate.getTime() === today.getTime()) ||
      (filters.date === "Tomorrow" &&
        eventDate.getTime() === tomorrow.getTime()) ||
      (filters.date === "This Week" &&
        eventDate >= today &&
        eventDate <= weekEnd) ||
      (filters.date === "This Weekend" &&
        eventDate >= weekendStart &&
        eventDate <= weekendEnd);

    const matchesPrice =
      filters.price === "Any Price" ||
      (filters.price === "Free" && price === 0) ||
      (filters.price === "Paid" && price > 0) ||
      (filters.price === "Under $25" && price <= 25) ||
      (filters.price === "Under $100" && price <= 100);

    return (
      matchesDate &&
      matchesPrice &&
      event.distance <= Number(filters.distance)
    );
  });
}

export default function Events() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: "Anytime",
    price: "Any Price",
    distance: 50,
  });

  const filteredEvents = useMemo(() => filterEvents(filters), [filters]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
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

      <div className="relative z-10">
        <FeaturedEvent />
        <EventGrid
          events={filteredEvents}
          onFilterClick={() => setFilterOpen(true)}
        />
      </div>
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        getResultCount={(draftFilters) => filterEvents(draftFilters).length}
      />
    </main>
  );
}
