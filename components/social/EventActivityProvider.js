"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const EventActivityContext = createContext(null);

export function EventActivityProvider({ children, authenticated = false }) {
  const [activity, setActivity] = useState({});
  const [pendingEventId, setPendingEventId] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      setActivity({});
      return;
    }

    let active = true;
    async function loadActivity() {
      try {
        const response = await fetch("/api/events/activity", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Event choices could not be loaded.");
        if (active) setActivity(payload.activity || {});
      } catch (loadError) {
        if (active) setError(loadError.message);
      }
    }

    loadActivity();
    return () => {
      active = false;
    };
  }, [authenticated]);

  const setEventStatus = useCallback(async (eventId, status, options = {}) => {
    const returnTo = options.returnTo || `/events?eventId=${eventId}&eventStatus=${status}`;
    if (!authenticated) {
      router.push(`/auth?callbackUrl=${encodeURIComponent(returnTo)}`);
      return { authenticated: false, saved: false };
    }

    setPendingEventId(eventId);
    setError("");
    try {
      const response = await fetch("/api/events/activity", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        router.push(`/auth?callbackUrl=${encodeURIComponent(returnTo)}`);
        return { authenticated: false, saved: false };
      }
      if (!response.ok) throw new Error(payload.error || "Event choice could not be saved.");
      setActivity(payload.activity || {});
      return { authenticated: true, saved: true };
    } catch (saveError) {
      setError(saveError.message);
      return { authenticated: true, saved: false, error: saveError.message };
    } finally {
      setPendingEventId(null);
    }
  }, [authenticated, router]);

  const value = useMemo(
    () => ({ activity, setEventStatus, pendingEventId, error, authenticated }),
    [activity, setEventStatus, pendingEventId, error, authenticated],
  );

  return (
    <EventActivityContext.Provider value={value}>
      {children}
    </EventActivityContext.Provider>
  );
}

export function useEventActivity() {
  const context = useContext(EventActivityContext);
  if (!context) {
    throw new Error("useEventActivity must be used inside EventActivityProvider");
  }
  return context;
}
