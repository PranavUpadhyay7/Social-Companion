"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

export default function EventChatWorkspace() {
  const [rooms, setRooms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/event-chats", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Event chats could not be loaded.");
        setRooms(payload.rooms || []);
        setActiveId(payload.rooms?.[0]?.eventId || null);
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  const loadMessages = useCallback(async () => {
    if (!activeId) return;
    const response = await fetch(`/api/event-chats/${activeId}/messages`, { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setMessages(payload.messages || []);
  }, [activeId]);

  useEffect(() => {
    loadMessages();
    if (!activeId) return undefined;
    const timer = window.setInterval(loadMessages, 5000);
    return () => window.clearInterval(timer);
  }, [activeId, loadMessages]);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    const response = await fetch(`/api/event-chats/${activeId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error || "Message could not be sent.");
    setMessages((current) => [...current, payload.message]);
    setDraft("");
  };

  if (!rooms.length) return <div className="mt-10 border border-white/10 bg-black/55 px-6 py-20 text-center"><MessageCircle className="mx-auto text-[#a95bf4]" /><h2 className="mt-5 text-3xl tracking-[-0.04em]">No event chat unlocked yet</h2><p className="mx-auto mt-3 max-w-[48ch] text-sm leading-6 text-zinc-500">Your event community appears automatically after a ticket payment or guest-list confirmation.</p>{error && <p className="mt-4 text-xs text-red-200">{error}</p>}</div>;

  return <div className="mt-10 grid min-h-[560px] overflow-hidden border border-white/10 bg-[#09090b] md:grid-cols-[280px_1fr]">
    <aside className="border-b border-white/10 p-4 md:border-b-0 md:border-r"><p className="px-2 pb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Your event communities</p>{rooms.map((room) => <button key={room.id} type="button" onClick={() => setActiveId(room.eventId)} className={`mb-2 w-full px-4 py-4 text-left text-sm ${activeId === room.eventId ? "bg-[#a95bf4] text-black" : "bg-white/[0.035] text-zinc-300 hover:bg-white/[0.07]"}`}>{room.eventName}<span className="mt-1 block text-[10px] opacity-65">Deletes {new Date(room.expiresAt).toLocaleString("en-IN")}</span></button>)}</aside>
    <section className="flex min-h-[420px] flex-col"><div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5">{messages.map((message) => <p key={message.id} className="max-w-[75%] bg-white/[0.07] px-4 py-3 text-sm leading-6 text-zinc-200"><span className="mb-1 block font-mono text-[9px] text-[#c58aff]">{message.senderProfileId.slice(-8)}</span>{message.text}</p>)}</div><form onSubmit={send} className="flex gap-2 border-t border-white/10 p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} placeholder="Message the event community" className="min-w-0 flex-1 bg-white/[0.05] px-4 text-sm outline-none focus:ring-1 focus:ring-[#a95bf4]" /><button type="submit" disabled={!draft.trim()} className="flex h-12 w-12 items-center justify-center bg-[#a95bf4] text-black disabled:opacity-30"><Send size={17} /></button></form>{error && <p className="px-4 pb-3 text-xs text-red-200">{error}</p>}</section>
  </div>;
}
