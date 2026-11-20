"use client";

import { useEffect, useState } from "react";
import { Flag, X } from "lucide-react";

const reasons = ["Event concern", "Misleading information", "Payment concern", "Venue mismatch", "Cancellation issue"];

export default function ReportDialog({ event }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [state, setState] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const close = (keyboardEvent) => { if (keyboardEvent.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const submit = async (submitEvent) => {
    submitEvent.preventDefault(); setSaving(true); setState("");
    const response = await fetch("/api/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ targetType: "event", targetId: String(event.id), reason, details }) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) { if (response.status === 401) window.location.href = `/auth?callbackUrl=${encodeURIComponent("/events")}`; else setState(result.error); return; }
    setState(result.message); setDetails("");
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 transition hover:text-white"><Flag size={12} /> Report</button>
    {open && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"><button type="button" aria-label="Close report dialog" className="absolute inset-0" onClick={() => setOpen(false)} /><form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="report-title" className="relative w-full max-w-lg border border-white/15 bg-[#0b0b0d] p-6 text-left text-white"><button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid size-9 place-items-center border border-white/15"><X size={15} /></button><h2 id="report-title" className="pr-12 text-3xl tracking-[-0.04em]">Report this event</h2><p className="mt-3 text-sm leading-6 text-zinc-500">Reports are stored for platform review. Submitting a report does not automatically remove an event.</p><label className="mt-6 block text-xs text-zinc-400">Reason<select value={reason} onChange={(changeEvent) => setReason(changeEvent.target.value)} className="mt-2 min-h-12 w-full border border-white/15 bg-black px-4 text-sm text-white">{reasons.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-4 block text-xs text-zinc-400">What happened?<textarea required minLength={10} maxLength={1200} rows={5} value={details} onChange={(changeEvent) => setDetails(changeEvent.target.value)} className="mt-2 w-full border border-white/15 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#a95bf4]" /></label>{state && <p role="status" className="mt-4 text-sm text-[#d9b7ff]">{state}</p>}<button disabled={saving} className="mt-5 min-h-11 bg-white px-5 text-sm font-semibold text-black disabled:opacity-60">{saving ? "Submitting..." : "Submit report"}</button></form></div>}
  </>;
}
