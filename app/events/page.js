"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import EventGrid from "@/components/events/EventGrid";
import FilterDrawer from "@/components/events/FilterDrawer";
import CreateEventModal from "@/components/events/CreateEventModal";
import { events } from "@/data/events";
import { useEventActivity } from "@/components/social/EventActivityProvider";

function filterEvents(eventsToFilter, filters) {
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

  return eventsToFilter.filter((event) => {
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
      (filters.price === "Under ₹2,000" && price <= 2000) ||
      (filters.price === "Under ₹5,000" && price <= 5000);

    const matchesCity =
      filters.city === "All Cities" ||
      (event.city || "Mumbai") === filters.city;

    return (
      matchesCity &&
      matchesDate &&
      matchesPrice &&
      event.distance <= Number(filters.distance)
    );
  });
}

export default function Events() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadedEvents, setUploadedEvents] = useState([]);
  const [filters, setFilters] = useState({
    city: "All Cities",
    date: "Anytime",
    price: "Any Price",
    distance: 50,
  });

  const allEvents = useMemo(
    () => [...events, ...uploadedEvents],
    [uploadedEvents],
  );
  const filteredEvents = useMemo(
    () => filterEvents(allEvents, filters),
    [allEvents, filters],
  );
  const { authenticated, setEventStatus } = useEventActivity();
  const handledAction = useRef("");
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch("/api/events", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (response.ok && active) setUploadedEvents(payload.events || []);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const params = new URLSearchParams(window.location.search);
    const eventId = Number(params.get("eventId"));
    const status = params.get("eventStatus");
    const actionKey = `${eventId}:${status}`;
    if (
      handledAction.current === actionKey ||
      !Number.isInteger(eventId) ||
      !["interested", "going"].includes(status)
    ) {
      return;
    }

    handledAction.current = actionKey;
    setEventStatus(eventId, status, { returnTo: "/events" }).then((result) => {
      if (result.saved) router.replace("/events#upcoming-events", { scroll: false });
    });
  }, [authenticated, router, setEventStatus]);

  useEffect(() => {
    if (!authenticated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("createEvent") === "1") setCreateOpen(true);
  }, [authenticated]);

  const openCreateEvent = () => {
    if (!authenticated) {
      router.push(`/auth?callbackUrl=${encodeURIComponent("/events?createEvent=1")}`);
      return;
    }
    setCreateOpen(true);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">

      <div className="relative z-10">
        <FeaturedEvent />
        <EventGrid
          events={filteredEvents}
          onFilterClick={() => setFilterOpen(true)}
          onCreateClick={openCreateEvent}
        />
      </div>
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        getResultCount={(draftFilters) => filterEvents(allEvents, draftFilters).length}
      />
      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(event) => {
          if (["Published", "published"].includes(event.status)) {
            setUploadedEvents((current) => [event, ...current]);
          } else {
            router.push("/promoter");
          }
        }}
      />
    </main>
  );
}
