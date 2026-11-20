"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AtSign, CalendarDays, TicketCheck } from "lucide-react";

const emptyForm = { accountType: "personal", fullName: "", displayName: "", phone: "", website: "", instagram: "", businessRegistration: "", taxIdentifier: "" };

function Metric({ value, label }) {
  return <div className="border-l border-[#a95bf4]/60 pl-4 sm:pl-6"><strong className="block text-4xl font-medium tracking-[-0.055em] sm:text-5xl">{Number(value || 0).toLocaleString("en-IN")}</strong><span className="mt-2 block text-xs text-zinc-500">{label}</span></div>;
}

export default function PromoterStudio() {
  const [promoter, setPromoter] = useState(undefined);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [profileResponse, eventResponse] = await Promise.all([fetch("/api/promoter/profile", { cache: "no-store" }), fetch("/api/promoter/events", { cache: "no-store" })]);
      if (profileResponse.status === 401) { window.location.href = `/auth?callbackUrl=${encodeURIComponent("/promoter")}`; return; }
      const profilePayload = await profileResponse.json();
      const eventPayload = await eventResponse.json();
      const item = profilePayload.promoter || null;
      setPromoter(item);
      setEvents(eventPayload.events || []);
      if (item) setForm((current) => ({ ...current, accountType: item.accountType || "personal", fullName: item.fullName || "", displayName: item.displayName || "", phone: item.phone || "", website: item.website || "", instagram: item.instagram || "", businessRegistration: item.businessRegistration || "" }));
    } catch { setError("Promoter Studio could not be loaded."); setPromoter(null); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/promoter/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Promoter profile could not be saved.");
      setPromoter(result.promoter);
      setForm((current) => ({ ...current, instagram: result.promoter.instagram || current.instagram }));
      setMessage(result.message);
    } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  };

  const eventAction = async (eventId, action) => {
    setError(""); setMessage("");
    try {
      const response = await fetch(`/api/promoter/events/${eventId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Event could not be updated.");
      setEvents((current) => current.map((item) => item.eventId === eventId ? { ...item, ...result.event } : item));
      setMessage("Event updated.");
    } catch (actionError) { setError(actionError.message); }
  };

  const inputClass = "mt-2 min-h-12 w-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-[#a95bf4]";
  if (promoter === undefined) return <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8"><div className="h-44 animate-pulse bg-white/[0.035]" /></div>;

  return <section className="mx-auto max-w-[1320px] px-5 pb-24 pt-12 sm:px-8 lg:px-10">
    <header className="max-w-[760px]"><h1 className="text-5xl font-medium leading-[0.94] tracking-[-0.055em] sm:text-7xl">Promoter Studio</h1><p className="mt-6 max-w-[62ch] text-base leading-8 text-zinc-400">Manage your public promoter identity and events. Your history is shown through completed events and real attendee check-ins.</p></header>
    <nav aria-label="Promoter Studio sections" className="mt-10 flex gap-7 border-b border-white/10">{[["profile", "Profile"], ["events", "My events"]].map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} className={`min-h-12 border-b px-1 text-sm transition ${tab === value ? "border-[#c58aff] text-white" : "border-transparent text-zinc-500 hover:text-zinc-200"}`}>{label}</button>)}</nav>
    {(message || error) && <p role={error ? "alert" : "status"} className={`mt-6 border px-4 py-3 text-sm ${error ? "border-red-400/30 text-red-200" : "border-[#c58aff]/30 text-[#dfc1ff]"}`}>{error || message}</p>}

    {tab === "profile" ? <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="border border-white/10 bg-[#0b0b0d]/95 p-6 sm:p-8">
        <p className="text-xs text-[#c58aff]">Public promoter history</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.045em]">{promoter?.displayName || "Create your profile"}</h2>
        <div className="mt-9 grid grid-cols-2 gap-6"><Metric value={promoter?.completedEventCount} label="Events hosted" /><Metric value={promoter?.totalAttendees} label="Total attendees" /></div>
        {promoter?.instagram ? <a href={promoter.instagram} target="_blank" rel="noreferrer" className="mt-9 inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 text-sm text-zinc-200 transition hover:border-[#c58aff] active:scale-[0.98]"><AtSign size={17} /> View connected Instagram</a> : <p className="mt-9 text-sm leading-6 text-zinc-500">Connect a public Instagram profile to create your promoter identity.</p>}
        <p className="mt-8 text-xs leading-6 text-zinc-600">Only completed events and attendee check-ins are counted. These figures are generated by SceneMates and cannot be edited.</p>
      </aside>
      <form onSubmit={save} className="border border-white/10 bg-[#0b0b0d]/95 p-5 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset className="sm:col-span-2"><legend className="text-xs font-medium text-zinc-300">Account type</legend><div className="mt-2 grid grid-cols-2 gap-2">{["personal", "business"].map((type) => <button key={type} type="button" onClick={() => update("accountType", type)} className={`min-h-12 border px-4 text-sm capitalize ${form.accountType === type ? "border-[#c58aff] bg-[#a95bf4]/15 text-white" : "border-white/10 text-zinc-500"}`}>{type}</button>)}</div></fieldset>
          <label className="text-xs text-zinc-300">Full legal name<input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className={inputClass} /></label>
          <label className="text-xs text-zinc-300">Promoter or business name<input required value={form.displayName} onChange={(event) => update("displayName", event.target.value)} className={inputClass} /></label>
          <label className="text-xs text-zinc-300">Phone with country code<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 98765 43210" className={inputClass} /></label>
          <label className="text-xs text-zinc-300">Instagram profile <span className="text-[#c58aff]">Required</span><input required value={form.instagram} onChange={(event) => update("instagram", event.target.value)} placeholder="@promoter or Instagram URL" className={inputClass} /></label>
          <label className="sm:col-span-2 text-xs text-zinc-300">Website <span className="text-zinc-600">Optional</span><input value={form.website} onChange={(event) => update("website", event.target.value)} placeholder="https://" className={inputClass} /></label>
          {form.accountType === "business" && <><label className="text-xs text-zinc-300">Business registration <span className="text-zinc-600">Optional</span><input value={form.businessRegistration} onChange={(event) => update("businessRegistration", event.target.value)} className={inputClass} /></label><label className="text-xs text-zinc-300">GSTIN <span className="text-zinc-600">Optional</span><input value={form.taxIdentifier} onChange={(event) => update("taxIdentifier", event.target.value)} className={inputClass} /></label></>}
        </div>
        <button disabled={saving} type="submit" className="mt-8 min-h-12 bg-white px-7 text-sm font-semibold text-black transition hover:bg-[#dfc1ff] active:scale-[0.98] disabled:opacity-60">{saving ? "Saving..." : promoter ? "Save profile" : "Create promoter profile"}</button>
      </form>
    </div> : <div className="mt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-3xl font-medium tracking-[-0.04em]">Your events</h2><p className="mt-2 text-sm text-zinc-500">Create events and manage their guest lists from one place.</p></div><Link href="/events?createEvent=1" className="inline-flex min-h-12 items-center justify-center bg-white px-6 text-sm font-semibold text-black transition hover:bg-[#dfc1ff] active:scale-[0.98]">Create event</Link></div>
      {events.length ? <div className="mt-8 grid gap-4">{events.map((item) => <article key={item.eventId} className="grid gap-6 border border-white/10 bg-[#0b0b0d]/95 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-2xl tracking-[-0.035em]">{item.title}</h3><span className="border border-white/15 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-400">{item.status}</span></div><p className="mt-3 text-sm text-zinc-500">{item.venue}, {item.city} · {item.dateISO}</p><div className="mt-4 flex flex-wrap gap-5 text-xs text-zinc-400"><span>{item.metrics?.Pending || 0} requests</span><span>{item.metrics?.Confirmed || 0} confirmed</span><span>{item.metrics?.["Checked In"] || 0} attended</span></div></div><div className="flex flex-wrap gap-2 lg:justify-end">{item.status === "Venue Confirmed" && <button type="button" onClick={() => eventAction(item.eventId, "publish")} className="min-h-10 bg-white px-4 text-xs font-semibold text-black">Publish event</button>}{item.guestListSettings?.enabled && <Link href={`/groups?guestListEvent=${item.eventId}`} className="inline-flex min-h-10 items-center border border-white/15 px-4 text-xs transition hover:border-[#c58aff]">Manage guest list</Link>}</div></article>)}</div> : <div className="mt-8 border border-white/10 bg-[#0b0b0d]/95 px-6 py-16 text-center"><CalendarDays className="mx-auto text-[#a95bf4]" /><h3 className="mt-5 text-3xl tracking-[-0.04em]">No events yet</h3><p className="mx-auto mt-3 max-w-[46ch] text-sm leading-6 text-zinc-500">Create your promoter profile with Instagram, then list your first event.</p></div>}
      <div className="mt-8 flex items-start gap-3 border border-white/10 px-5 py-4 text-xs leading-6 text-zinc-500"><TicketCheck size={17} className="mt-0.5 shrink-0 text-[#a95bf4]" /><p>Events are independently organised. Attendees should review the promoter history, Instagram profile, event details and refund terms before booking.</p></div>
    </div>}
  </section>;
}
