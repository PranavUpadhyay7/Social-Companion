"use client";

import { useEffect, useState } from "react";
import { TicketCheck } from "lucide-react";

export default function PublicGuestRequest() {
  const [context, setContext] = useState(null);
  const [form, setForm] = useState({ guestName: "", phone: "", plusOnes: "0" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = Number(params.get("eventId"));
    if (!Number.isSafeInteger(eventId)) return;
    fetch("/api/events", { cache: "no-store" }).then((response) => response.json()).then((payload) => {
      const event = payload.events?.find((item) => item.id === eventId);
      if (event) setContext({ event, referralCode: params.get("ref") || "" });
    }).catch(() => null);
  }, []);
  if (!context) return null;
  const submit = async (submitEvent) => {
    submitEvent.preventDefault(); setError(""); setMessage("");
    const response = await fetch("/api/guest-list", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId: context.event.id, source: "public_request", referralCode: context.referralCode, ...form }) });
    const result = await response.json();
    if (response.status === 401) { window.location.href = `/auth?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`; return; }
    if (!response.ok) { setError(result.error); return; }
    setMessage(result.message);
  };
  return <section className="mx-auto max-w-[1500px] px-5 pt-8 sm:px-8 lg:px-10"><div className="grid gap-6 border border-[#c58aff]/35 bg-[#0b0b0d]/95 p-5 lg:grid-cols-[1fr_0.8fr] lg:p-8"><div><TicketCheck size={20} className="text-[#a95bf4]" /><h2 className="mt-4 text-3xl tracking-[-0.04em] sm:text-4xl">Request the {context.event.shortTitle} guest list</h2><p className="mt-4 max-w-[58ch] text-sm leading-7 text-zinc-400">Approval does not guarantee entry. Review the organiser and event details, then make sure you meet the ID, age, arrival and venue conditions.</p>{context.event.promoter && <div className="mt-5 text-xs leading-6 text-zinc-500"><a href={context.event.promoter.instagram} target="_blank" rel="noreferrer" className="text-zinc-200 hover:text-[#d9b7ff]">{context.event.promoter.displayName} on Instagram</a><span> · {context.event.promoter.completedEventCount} events hosted · {Number(context.event.promoter.totalAttendees || 0).toLocaleString("en-IN")} attendees</span><p className="mt-2 text-zinc-600">This event is independently organised. Review its details and refund terms before joining.</p></div>}</div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2 text-xs text-zinc-400">Guest name<input required value={form.guestName} onChange={(event) => setForm((current) => ({ ...current, guestName: event.target.value }))} className="mt-2 min-h-11 w-full border border-white/15 bg-black px-3 text-sm text-white" /></label><label className="text-xs text-zinc-400">Phone<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-2 min-h-11 w-full border border-white/15 bg-black px-3 text-sm text-white" /></label><label className="text-xs text-zinc-400">Plus ones<input type="number" min="0" max="5" value={form.plusOnes} onChange={(event) => setForm((current) => ({ ...current, plusOnes: event.target.value }))} className="mt-2 min-h-11 w-full border border-white/15 bg-black px-3 text-sm text-white" /></label>{(message || error) && <p role={error ? "alert" : "status"} className={`sm:col-span-2 text-sm ${error ? "text-red-200" : "text-[#d9b7ff]"}`}>{error || message}</p>}<button type="submit" className="sm:col-span-2 min-h-11 bg-white text-sm font-semibold text-black">Send request</button></form></div></section>;
}
