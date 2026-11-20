"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, QrCode, Search, ShieldAlert, TicketCheck } from "lucide-react";

export default function DoorCheckIn() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [state, setState] = useState({ type: "idle", message: "Search a confirmed guest or enter a pass ID." });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/check-in", { cache: "no-store" }).then(async (response) => {
      if (response.status === 401) { window.location.href = `/auth?callbackUrl=${encodeURIComponent("/door")}`; return; }
      const payload = await response.json();
      setEvents(payload.events || []);
      setEventId(String(payload.events?.[0]?.eventId || ""));
      setLoading(false);
    }).catch(() => { setState({ type: "error", message: "Door assignments could not be loaded." }); setLoading(false); });
  }, []);

  const search = async (event) => {
    event.preventDefault();
    if (!eventId || query.trim().length < 2) return;
    setState({ type: "idle", message: "Checking the server..." });
    const response = await fetch(`/api/check-in?eventId=${eventId}&query=${encodeURIComponent(query.trim())}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) { setState({ type: "error", message: payload.error }); setResults([]); return; }
    setResults(payload.results || []);
    setState({ type: payload.results?.length ? "idle" : "error", message: payload.results?.length ? "Choose the matching guest." : "No valid guest record found." });
  };

  const checkIn = async (guest) => {
    const response = await fetch("/api/check-in", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId: Number(eventId), guestEntryId: guest.id, method: "search" }) });
    const payload = await response.json();
    const labels = { valid: "Entry recorded", already_used: "Pass already used", cancelled: "Pass cancelled", invalid: "Invalid pass" };
    setState({ type: payload.result === "valid" ? "success" : "error", message: payload.result === "valid" ? `${labels.valid} for ${payload.guest.guestName}.` : payload.error || labels[payload.result] || "Check-in failed." });
    if (payload.result === "valid") setResults((current) => current.map((item) => item.id === guest.id ? { ...item, status: "Checked In", checkInStatus: "Checked In" } : item));
  };

  return (
    <section className="mx-auto max-w-[1250px] px-5 pb-24 pt-12 sm:px-8 lg:px-10">
      <header className="max-w-[780px]"><h1 className="text-5xl font-medium leading-[0.92] tracking-[-0.055em] sm:text-7xl">Door check-in</h1><p className="mt-6 max-w-[65ch] text-base leading-8 text-zinc-400">Validate every pass through the server. Search and QR-ready input use the same duplicate-safe check-in record.</p></header>
      {loading ? <div className="mt-10 h-60 animate-pulse border border-white/10 bg-white/[0.035]" /> : !events.length ? <div className="mt-10 border border-white/10 bg-black/60 px-6 py-20 text-center"><ShieldAlert className="mx-auto text-[#a95bf4]" /><h2 className="mt-5 text-3xl tracking-[-0.04em]">No event assignment</h2><p className="mx-auto mt-3 max-w-[50ch] text-sm leading-6 text-zinc-500">A promoter or platform admin must assign door staff to a venue-confirmed event.</p></div> : <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="border border-white/10 bg-[#0b0b0d]/90 p-5 sm:p-7"><TicketCheck size={19} className="text-[#a95bf4]" /><h2 className="mt-4 text-2xl tracking-[-0.035em]">Active door</h2><label className="mt-6 block text-xs text-zinc-500">Assigned event<select value={eventId} onChange={(event) => { setEventId(event.target.value); setResults([]); }} className="mt-2 min-h-12 w-full border border-white/15 bg-black px-4 text-sm text-white outline-none focus:border-[#a95bf4]">{events.map((item) => <option key={item.eventId} value={item.eventId}>{item.title}</option>)}</select></label><p className="mt-6 text-xs leading-6 text-zinc-600">A client-side QR preview is never treated as proof. The server confirms pass state and creates a unique check-in record.</p></aside>
        <div className="border border-white/10 bg-[#0b0b0d]/90 p-5 sm:p-7"><form onSubmit={search}><label className="text-xs text-zinc-500">Guest name or pass ID<span className="mt-2 flex min-h-12 items-center gap-3 border border-white/15 px-4 focus-within:border-[#a95bf4]"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Aarav Mehta or SM-..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-700" /><QrCode size={17} className="text-[#a95bf4]" /></span></label><button type="submit" className="mt-3 min-h-11 bg-white px-5 text-sm font-semibold text-black active:scale-[0.98]">Validate on server</button></form>
          <div className={`mt-6 border p-4 text-sm ${state.type === "success" ? "border-emerald-400/30 text-emerald-200" : state.type === "error" ? "border-red-400/30 text-red-200" : "border-white/10 text-zinc-500"}`}>{state.type === "success" && <CheckCircle2 size={17} className="mb-2" />}{state.message}</div>
          <div className="mt-4 grid gap-2">{results.map((guest) => <button key={guest.id} type="button" onClick={() => checkIn(guest)} disabled={guest.checkInStatus === "Checked In"} className="flex min-h-16 items-center justify-between border border-white/10 px-4 text-left transition hover:border-[#c58aff]/50 disabled:cursor-not-allowed disabled:opacity-50"><span><strong className="block text-sm">{guest.guestName}</strong><span className="mt-1 block text-xs text-zinc-600">{guest.passId || "Pass not issued"} · +{guest.plusOnes}</span></span><span className="text-xs text-[#d9b7ff]">{guest.checkInStatus === "Checked In" ? "Already used" : "Check in"}</span></button>)}</div>
        </div>
      </div>}
    </section>
  );
}
