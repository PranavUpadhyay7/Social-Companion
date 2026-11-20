"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clipboard, Search, TicketCheck, UserPlus, Users } from "lucide-react";

const statuses = ["All", "Pending", "Approved", "Payment Required", "Confirmed", "Checked In", "Declined", "Cancelled"];

export default function GuestListWorkspace() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [guestList, setGuestList] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState({ source: "promoter_invitation", guestName: "", phone: "", plusOnes: "0", notes: "", targetProfileId: "" });
  const [userResults, setUserResults] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadGuestList = useCallback(async (nextEventId) => {
    if (!nextEventId) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/guest-list?eventId=${nextEventId}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Guest list could not be loaded.");
      setGuestList(result);
    } catch (loadError) {
      setError(loadError.message);
      setGuestList(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/promoter/events", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      const owned = result.events || [];
      setEvents(owned);
      const requested = new URLSearchParams(window.location.search).get("guestListEvent");
      const first = owned.find((event) => String(event.eventId) === requested)?.eventId || owned[0]?.eventId || "";
      setEventId(String(first));
      if (first) loadGuestList(first);
      else setLoading(false);
    }).catch(() => { if (active) { setError("Promoter events could not be loaded."); setLoading(false); } });
    return () => { active = false; };
  }, [loadGuestList]);

  const filtered = useMemo(() => (guestList?.guests || []).filter((guest) => {
    const matchesStatus = status === "All" || guest.status === status;
    const matchesQuery = !query.trim() || `${guest.guestName} ${guest.passId}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  }), [guestList, query, status]);

  const addGuest = async (event) => {
    event.preventDefault();
    setError(""); setFeedback("");
    const response = await fetch("/api/guest-list", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId: Number(eventId), ...form }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); return; }
    setForm({ source: "promoter_invitation", guestName: "", phone: "", plusOnes: "0", notes: "", targetProfileId: "" });
    setFeedback(result.message);
    loadGuestList(eventId);
  };

  const bulkUpdate = async (nextStatus) => {
    if (!selected.size) return;
    const response = await fetch("/api/guest-list", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId: Number(eventId), guestIds: [...selected], status: nextStatus }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); return; }
    setSelected(new Set()); setFeedback(result.message); loadGuestList(eventId);
  };

  if (loading) return <div className="mt-10 h-64 animate-pulse border border-white/10 bg-white/[0.035]" />;
  if (!events.length) return <div className="mt-10 border border-white/10 bg-black/50 px-6 py-16 text-center"><TicketCheck className="mx-auto text-[#a95bf4]" /><h2 className="mt-5 text-3xl tracking-[-0.04em]">No verified guest list yet</h2><p className="mx-auto mt-3 max-w-[52ch] text-sm leading-6 text-zinc-500">Create an event, request venue confirmation and publish it before guest-list actions become available.</p><Link href="/promoter" className="mt-6 inline-flex min-h-11 items-center bg-white px-5 text-sm font-semibold text-black">Open promoter studio</Link></div>;

  const capacity = guestList?.event?.capacity || 0;
  const occupied = (guestList?.metrics?.Approved || 0) + (guestList?.metrics?.Confirmed || 0) + (guestList?.metrics?.["Checked In"] || 0);
  const shareUrl = guestList?.event?.settings?.referralCode ? `${window.location.origin}/groups?eventId=${eventId}&ref=${encodeURIComponent(guestList.event.settings.referralCode)}` : "";

  return (
    <div className="mt-10">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><label className="text-xs text-zinc-500">Event<select value={eventId} onChange={(event) => { setEventId(event.target.value); loadGuestList(event.target.value); }} className="mt-2 block min-h-12 w-full max-w-xl border border-white/15 bg-[#0b0b0d] px-4 text-sm text-white outline-none focus:border-[#a95bf4]">{events.map((item) => <option key={item.eventId} value={item.eventId}>{item.title}</option>)}</select></label></div>
        {shareUrl && <button type="button" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setFeedback("Guest-list link copied. No external message was sent."); }} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-5 text-sm"><Clipboard size={15} /> Copy guest link</button>}
      </div>
      {(feedback || error) && <p role={error ? "alert" : "status"} className={`mt-5 border px-4 py-3 text-sm ${error ? "border-red-400/30 text-red-200" : "border-[#c58aff]/30 text-[#dfc1ff]"}`}>{error || feedback}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Requests", guestList?.metrics?.Pending || 0], ["Confirmed", guestList?.metrics?.Confirmed || 0], ["Checked in", guestList?.metrics?.["Checked In"] || 0], ["Capacity", `${occupied}/${capacity}`]].map(([label, value]) => <div key={label} className="border border-white/10 bg-[#0b0b0d]/90 p-5"><p className="text-xs text-zinc-500">{label}</p><strong className="mt-2 block text-3xl font-medium tracking-[-0.04em]">{value}</strong></div>)}</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="border border-white/10 bg-[#0b0b0d]/90">
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex min-h-11 w-full items-center gap-3 border border-white/10 px-4 lg:max-w-sm"><Search size={15} className="text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or pass ID" className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-700" /></label>
            <div className="flex gap-2 overflow-x-auto">{statuses.map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`min-h-9 shrink-0 border px-3 text-[10px] ${status === item ? "border-[#c58aff] text-white" : "border-white/10 text-zinc-600"}`}>{item}</button>)}</div>
          </div>
          {selected.size > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#a95bf4]/10 px-4 py-3"><span className="mr-2 text-xs text-[#dfc1ff]">{selected.size} selected</span>{["Approved", "Payment Required", "Confirmed", "Declined"].map((item) => <button key={item} type="button" onClick={() => bulkUpdate(item)} className="min-h-8 border border-white/15 px-3 text-[10px]">Set {item}</button>)}</div>}
          {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-[10px] uppercase tracking-[0.1em] text-zinc-600"><tr><th className="p-4">Select</th><th className="p-4">Guest</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4">Payment</th><th className="p-4">Plus ones</th><th className="p-4">Created</th></tr></thead><tbody>{filtered.map((guest) => <tr key={guest.id} className="border-t border-white/[0.06]"><td className="p-4"><input aria-label={`Select ${guest.guestName}`} type="checkbox" checked={selected.has(guest.id)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(guest.id)) next.delete(guest.id); else next.add(guest.id); return next; })} className="accent-[#a95bf4]" /></td><td className="p-4"><strong className="font-medium">{guest.guestName}</strong><span className="mt-1 block text-xs text-zinc-600">{guest.phoneVerified ? "Phone verified" : "Phone not verified"}</span></td><td className="p-4 text-zinc-500">{guest.source.replaceAll("_", " ")}</td><td className="p-4 text-[#d9b7ff]">{guest.status}</td><td className="p-4 text-zinc-500">{guest.paymentStatus}</td><td className="p-4">{guest.plusOnes}</td><td className="p-4 text-zinc-600">{new Date(guest.createdAt).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div> : <div className="px-6 py-20 text-center"><Users className="mx-auto text-zinc-700" /><p className="mt-4 text-sm text-zinc-500">No guests match this view.</p></div>}
        </div>

        <form onSubmit={addGuest} className="h-fit border border-white/10 bg-[#0b0b0d]/90 p-5">
          <UserPlus size={18} className="text-[#a95bf4]" /><h3 className="mt-4 text-2xl tracking-[-0.035em]">Add guest</h3><p className="mt-2 text-xs leading-5 text-zinc-600">This creates an internal invitation. It does not send SMS, email or WhatsApp.</p>
          <div className="mt-6 grid gap-4"><label className="text-xs text-zinc-400">Entry method<select value={form.source} onChange={(event) => { setForm((current) => ({ ...current, source: event.target.value, targetProfileId: "" })); setUserResults([]); }} className="mt-2 min-h-11 w-full border border-white/10 bg-black px-3 text-sm text-white"><option value="promoter_invitation">Promoter invitation</option><option value="platform_user">Existing platform user</option></select></label>{[["Guest name", "guestName", "text"], ["Phone", "phone", "tel"], ["Plus ones", "plusOnes", "number"], ["Promoter notes", "notes", "text"]].map(([label, key, type]) => <label key={key} className="text-xs text-zinc-400">{label}<input required={key === "guestName"} type={type} min={type === "number" ? 0 : undefined} max={type === "number" ? 5 : undefined} value={form[key]} onChange={async (event) => { const value = event.target.value; setForm((current) => ({ ...current, [key]: value })); if (key === "guestName" && form.source === "platform_user" && value.trim().length >= 2) { const response = await fetch(`/api/guest-list?eventId=${eventId}&userSearch=${encodeURIComponent(value.trim())}`); const result = await response.json(); setUserResults(result.users || []); } }} className="mt-2 min-h-11 w-full border border-white/10 bg-white/[0.025] px-3 text-sm text-white outline-none focus:border-[#a95bf4]" /></label>)}{form.source === "platform_user" && userResults.length > 0 && <div className="grid gap-1">{userResults.map((user) => <button key={user.profileId} type="button" onClick={() => { setForm((current) => ({ ...current, guestName: user.name, targetProfileId: user.profileId })); setUserResults([]); }} className={`min-h-10 border px-3 text-left text-xs ${form.targetProfileId === user.profileId ? "border-[#c58aff]" : "border-white/10"}`}>{user.name}{user.city ? `, ${user.city}` : ""}</button>)}</div>}</div>
          <button type="submit" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-black active:scale-[0.98]"><Check size={15} /> Add to list</button>
        </form>
      </div>
      <p className="mt-5 text-xs leading-6 text-zinc-600">Guest-list approval does not guarantee admission. Every guest remains subject to identity, age, dress code, arrival deadline and venue discretion stated by the event.</p>
    </div>
  );
}
