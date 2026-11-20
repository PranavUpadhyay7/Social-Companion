"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, MapPin, X } from "lucide-react";
import { eventCities } from "@/data/events";

const categories = ["Nightlife", "Music", "Food", "Comedy", "Tech"];

const initialForm = {
  title: "",
  shortTitle: "",
  category: "Nightlife",
  city: "Mumbai",
  venue: "",
  description: "",
  exactVenueAddress: "",
  venueContact: "",
  dateISO: "",
  time: "",
  priceAmount: "",
  capacity: "",
  artistDetails: "",
  artistInstagram: "",
  minimumAge: "18",
  dressCode: "Smart casual",
  tableInformation: "",
  entryConditions: "",
  refundPolicy: "",
};

export default function CreateEventModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    dialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open, saving]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  if (!open) return null;

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseCover = (file) => {
    if (preview) URL.revokeObjectURL(preview);
    setCover(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.set(key, value));
      if (cover) payload.set("cover", cover);

      const response = await fetch("/api/events", { method: "POST", body: payload });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The event could not be published.");

      onCreated(result.event);
      setForm(initialForm);
      chooseCover(null);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 h-12 w-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#a95bf4]";

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/80 px-4 py-5 backdrop-blur-sm sm:py-10">
      <button type="button" aria-label="Close event form" onClick={onClose} className="absolute inset-0" />
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-event-title"
        className="relative mx-auto w-full max-w-[920px] border border-white/15 bg-[#0b0b0d] text-white shadow-[0_35px_120px_rgba(0,0,0,0.75)] outline-none"
      >
        <header className="flex items-start justify-between gap-6 border-b border-white/10 px-5 py-6 sm:px-8">
          <div>
            <h2 id="create-event-title" className="text-3xl font-medium uppercase tracking-[-0.04em] sm:text-4xl">
              List your event
            </h2>
            <p className="mt-2 max-w-[50ch] text-sm leading-6 text-zinc-500">
              Submit a complete event for venue confirmation and platform review. It will not appear publicly until approved.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center border border-white/15 text-zinc-400 transition hover:border-white/40 hover:text-white active:scale-95"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="grid gap-7 p-5 sm:p-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
              Event cover
              <span className="relative mt-3 flex aspect-[4/5] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-white/20 bg-white/[0.025] transition hover:border-[#a95bf4]">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Selected event cover" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-3 px-6 text-center text-zinc-600">
                    <ImagePlus size={24} strokeWidth={1.4} />
                    JPG, PNG or WebP · max 8 MB
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!cover}
                  onChange={(event) => chooseCover(event.target.files?.[0])}
                  className="sr-only"
                />
              </span>
            </label>
          </div>

          <div className="grid content-start gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Full event name
              <input required maxLength={140} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="After Dark: Warehouse Sessions" className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Card title
              <input required maxLength={45} value={form.shortTitle} onChange={(event) => update("shortTitle", event.target.value)} placeholder="After Dark" className={inputClass} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Category
              <select value={form.category} onChange={(event) => update("category", event.target.value)} className={inputClass}>
                {categories.map((category) => <option key={category} className="bg-zinc-950">{category}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-zinc-300">
              City
              <span className="relative block">
                <MapPin aria-hidden="true" size={15} className="pointer-events-none absolute left-4 top-[26px] z-10 text-[#a95bf4]" />
                <select value={form.city} onChange={(event) => update("city", event.target.value)} className={`${inputClass} pl-10`}>
                  {eventCities.map((city) => <option key={city} className="bg-zinc-950">{city}</option>)}
                </select>
              </span>
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Venue and area
              <input required maxLength={140} value={form.venue} onChange={(event) => update("venue", event.target.value)} placeholder="Famous Studios, Mahalaxmi" className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Event description
              <textarea required maxLength={3000} rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Describe the format, music and attendee experience." className={`${inputClass} h-auto min-h-28 py-3 leading-6`} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Exact venue address
              <input required maxLength={300} value={form.exactVenueAddress} onChange={(event) => update("exactVenueAddress", event.target.value)} placeholder="Building, street, area and PIN code" className={inputClass} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Venue contact
              <input required maxLength={120} value={form.venueContact} onChange={(event) => update("venueContact", event.target.value)} placeholder="Name and official contact" className={inputClass} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Date
              <input required type="date" value={form.dateISO} onChange={(event) => update("dateISO", event.target.value)} className={`${inputClass} [color-scheme:dark]`} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Time
              <input required maxLength={80} value={form.time} onChange={(event) => update("time", event.target.value)} placeholder="10:00 PM - 4:00 AM" className={inputClass} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Ticket price in ₹ <span className="text-zinc-600">(use 0 for free)</span>
              <input required type="number" min="0" max="1000000" step="1" value={form.priceAmount} onChange={(event) => update("priceAmount", event.target.value)} placeholder="1499" className={inputClass} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Capacity
              <input required type="number" min="1" max="1000000" value={form.capacity} onChange={(event) => update("capacity", event.target.value)} placeholder="350" className={inputClass} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Artist or performer details
              <textarea maxLength={1500} rows={3} value={form.artistDetails} onChange={(event) => update("artistDetails", event.target.value)} placeholder="Artist names, set format and representation contact where relevant." className={`${inputClass} h-auto py-3 leading-6`} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Artist Instagram <span className="text-zinc-600">(optional)</span>
              <input maxLength={160} value={form.artistInstagram} onChange={(event) => update("artistInstagram", event.target.value)} placeholder="@artistname or instagram.com/artistname" className={inputClass} />
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Minimum entry age
              <select value={form.minimumAge} onChange={(event) => update("minimumAge", event.target.value)} className={inputClass}>
                <option value="0" className="bg-zinc-950">All ages</option>
                <option value="18" className="bg-zinc-950">18+</option>
                <option value="21" className="bg-zinc-950">21+</option>
                <option value="25" className="bg-zinc-950">25+</option>
              </select>
              <span className="mt-2 block text-[11px] leading-5 text-zinc-600">Entry age only; local alcohol rules still apply.</span>
            </label>
            <label className="text-xs font-medium text-zinc-300">
              Dress code
              <select value={form.dressCode} onChange={(event) => update("dressCode", event.target.value)} className={inputClass}>
                {[
                  "No dress code",
                  "Casual",
                  "Smart casual",
                  "Partywear",
                  "Formal",
                  "Traditional / festive",
                  "Venue-specific",
                ].map((option) => <option key={option} className="bg-zinc-950">{option}</option>)}
              </select>
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Ticket and table information
              <textarea maxLength={1200} rows={3} value={form.tableInformation} onChange={(event) => update("tableInformation", event.target.value)} placeholder="Ticket tiers, table minimums and what each package includes." className={`${inputClass} h-auto py-3 leading-6`} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Entry conditions
              <textarea required maxLength={1200} rows={3} value={form.entryConditions} onChange={(event) => update("entryConditions", event.target.value)} placeholder="ID requirements, arrival cut-off, prohibited items and venue discretion." className={`${inputClass} h-auto py-3 leading-6`} />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-zinc-300">
              Refund and cancellation policy
              <textarea required maxLength={1600} rows={3} value={form.refundPolicy} onChange={(event) => update("refundPolicy", event.target.value)} placeholder="Explain refunds, rescheduling and event cancellation terms." className={`${inputClass} h-auto py-3 leading-6`} />
            </label>
            {error && <p role="alert" className="sm:col-span-2 text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="sm:col-span-2 h-12 bg-white px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#c58aff] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Listing event..." : "List event"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
