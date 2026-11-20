"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, QrCode, ShieldCheck, Users } from "lucide-react";

export default function DigitalPass({ passId }) {
  const [pass, setPass] = useState(undefined);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/guest-passes/${encodeURIComponent(passId)}`, { cache: "no-store" }).then(async (response) => {
      if (response.status === 401) { window.location.href = `/auth?callbackUrl=${encodeURIComponent(`/passes/${passId}`)}`; return; }
      const payload = await response.json();
      if (!response.ok) { setError(payload.error); setPass(null); return; }
      setPass(payload.pass);
    }).catch(() => { setError("Pass could not be loaded."); setPass(null); });
  }, [passId]);
  if (pass === undefined) return <div className="mx-auto max-w-2xl px-5 py-24"><div className="h-[520px] animate-pulse border border-white/10 bg-white/[0.035]" /></div>;
  if (!pass) return <div className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-4xl">Pass unavailable</h1><p className="mt-4 text-zinc-500">{error}</p></div>;
  const validityStyles = { valid: "border-emerald-400/40 text-emerald-200", already_used: "border-amber-400/40 text-amber-200", cancelled: "border-red-400/40 text-red-200", invalid: "border-red-400/40 text-red-200" };
  return <section className="mx-auto max-w-2xl px-5 pb-24 pt-12 sm:px-8"><div className="border border-white/15 bg-[#0b0b0d]/95 p-6 sm:p-9"><div className="flex items-start justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c58aff]">SceneMates guest pass</p><h1 className="mt-4 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">{pass.eventName}</h1></div><ShieldCheck size={28} className="text-[#a95bf4]" /></div><div className={`mt-7 inline-flex border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.13em] ${validityStyles[pass.validity]}`}>{pass.validity.replaceAll("_", " ")}</div><div className="mt-8 grid gap-4 border-y border-white/10 py-6 text-sm sm:grid-cols-2"><div><span className="text-zinc-600">Guest</span><strong className="mt-1 block text-lg">{pass.guestName}</strong></div><div><span className="text-zinc-600">Pass ID</span><strong className="mt-1 block font-mono text-sm">{pass.passId}</strong></div><p className="flex items-center gap-2 text-zinc-400"><MapPin size={15} /> {pass.venue}</p><p className="flex items-center gap-2 text-zinc-400"><CalendarDays size={15} /> {pass.dateISO}</p><p className="flex items-center gap-2 text-zinc-400"><Users size={15} /> Plus ones: {pass.plusOnes}</p><p className="text-zinc-400">Payment: {pass.paymentStatus}</p></div><div className="mt-8 flex aspect-square max-w-[280px] flex-col items-center justify-center border border-white/15 bg-white text-center text-black"><QrCode size={100} strokeWidth={1} /><strong className="mt-5 font-mono text-xs">{pass.qrValue}</strong><span className="mt-2 max-w-[22ch] text-[10px] text-zinc-600">QR-ready value. Door staff still validate it through the server.</span></div><div className="mt-8"><h2 className="text-lg font-medium">Entry conditions</h2><p className="mt-3 text-sm leading-7 text-zinc-400">{pass.entryConditions}</p>{pass.arrivalDeadline && <p className="mt-3 text-xs text-[#d9b7ff]">Arrive before {new Date(pass.arrivalDeadline).toLocaleString("en-IN")}</p>}</div></div></section>;
}
