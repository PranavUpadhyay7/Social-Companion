"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronRight, MessageCircle, Search, Send, X } from "lucide-react";

export default function ChatPanel({ chats, activeChatId, onSelectChat, onSendMessage, isOpen, onOpen, onClose, loading, error, onRetry }) {
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const reducedMotion = useReducedMotion();
  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];
  const filteredChats = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? chats.filter((chat) => `${chat.name} ${chat.event}`.toLowerCase().includes(value))
      : chats;
  }, [chats, query]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!activeChat || !draft.trim() || sending) return;
    setSending(true);
    const sent = await onSendMessage(activeChat.id, draft);
    if (sent) setDraft("");
    setSending(false);
  };

  const selectChat = (chatId, fromMobile = false) => {
    onSelectChat(chatId);
    if (fromMobile) setMobileThreadOpen(true);
  };

  const renderInbox = (mobile = false) => (
    <div className={`${mobile && mobileThreadOpen ? "hidden" : "flex"} min-h-0 flex-col border-white/10 md:flex md:border-r`}>
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.035em] text-white">Messages</h2>
          <p className="mt-1 text-[11px] text-zinc-500">Chats open after you vibe</p>
        </div>
        {mobile && (
          <button type="button" onClick={onClose} aria-label="Close messages" className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white md:hidden">
            <X size={17} />
          </button>
        )}
      </div>

      <label className="mx-4 flex items-center gap-2 rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-zinc-500 focus-within:ring-1 focus-within:ring-[#a95bf4]">
        <Search size={15} />
        <span className="sr-only">Search chats</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people or events" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600" />
      </label>

      <div className="px-4 pb-2 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-200">Vibed with</p>
          <p className="text-[10px] text-zinc-600">{chats.length}</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
          {chats.map((chat) => (
            <button key={`match-${chat.id}`} type="button" onClick={() => selectChat(chat.id, mobile)} className="w-[58px] shrink-0 text-center text-zinc-400 transition hover:text-white active:scale-[0.98]">
              <span className="relative mx-auto block h-13 w-13 rounded-full bg-gradient-to-br from-[#c58aff] to-[#6e2b9e] p-[2px]">
                <span className="relative block h-full w-full overflow-hidden rounded-full border-2 border-zinc-950">
                  <Image src={chat.image} alt="" fill sizes="52px" unoptimized={chat.image.startsWith("/api/profile/media/")} className="object-cover" />
                </span>
              </span>
              <span className="mt-2 block truncate text-[10px]">{chat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <p className="text-xs font-semibold text-white">Conversations</p>
        <p className="text-[10px] text-zinc-600">Recent</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div aria-label="Loading conversations" className="space-y-2 px-3 py-2">
            {[0, 1, 2].map((item) => <div key={item} className="h-[66px] animate-pulse rounded-xl bg-white/[0.04]" />)}
          </div>
        ) : error ? (
          <div className="px-4 py-9 text-center">
            <p className="text-xs leading-5 text-red-200">{error}</p>
            <button type="button" onClick={() => onRetry()} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs text-white active:scale-[0.98]">Try again</button>
          </div>
        ) : filteredChats.length ? filteredChats.map((chat) => {
          const lastMessage = chat.messages.at(-1)?.text || "You matched. Say hello.";
          const selected = activeChat?.id === chat.id;
          return (
            <button key={chat.id} type="button" onClick={() => selectChat(chat.id, mobile)} aria-pressed={selected} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition active:scale-[0.99] ${selected ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}>
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
                <Image src={chat.image} alt="" fill sizes="48px" unoptimized={chat.image.startsWith("/api/profile/media/")} className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-white">{chat.name}</span>
                <span className="mt-1 block truncate text-[11px] text-zinc-500">{lastMessage}</span>
              </span>
              <ChevronRight size={14} className="shrink-0 text-zinc-700" />
            </button>
          );
        }) : <p className="px-4 py-10 text-center text-xs text-zinc-600">No chats match your search.</p>}
      </div>
    </div>
  );

  const renderThread = (mobile = false) => (
    <div className={`${mobile && !mobileThreadOpen ? "hidden" : "flex"} min-h-0 flex-col md:flex`}>
      {activeChat ? (
        <>
          <header className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5">
            {mobile && <button type="button" onClick={() => setMobileThreadOpen(false)} aria-label="Back to conversations" className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"><ArrowLeft size={17} /></button>}
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"><Image src={activeChat.image} alt="" fill sizes="40px" unoptimized={activeChat.image.startsWith("/api/profile/media/")} className="object-cover" /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{activeChat.name}</p>
              <p className="mt-1 truncate text-[10px] text-[#c58aff]">Matched for {activeChat.event}</p>
            </div>
            {mobile && <button type="button" onClick={onClose} aria-label="Close messages" className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"><X size={17} /></button>}
          </header>

          <div className="flex min-h-[320px] flex-1 flex-col justify-end gap-2 overflow-y-auto px-5 py-5">
            {activeChat.messages.length ? activeChat.messages.map((message) => (
              <p key={message.id} className={`max-w-[76%] rounded-2xl px-4 py-2.5 text-xs leading-5 ${message.from === "me" ? "ml-auto rounded-br-md bg-[#a95bf4] text-zinc-950" : "rounded-bl-md bg-white/[0.08] text-zinc-200"}`}>{message.text}</p>
            )) : (
              <div className="my-auto text-center">
                <span className="relative mx-auto block h-20 w-20 overflow-hidden rounded-full border border-white/15"><Image src={activeChat.image} alt="" fill sizes="80px" unoptimized={activeChat.image.startsWith("/api/profile/media/")} className="object-cover" /></span>
                <p className="mt-4 text-base font-semibold text-white">You matched with {activeChat.name}</p>
                <p className="mx-auto mt-2 max-w-[30ch] text-xs leading-5 text-zinc-500">Start a conversation and make plans for {activeChat.event}.</p>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex gap-2 p-4">
            <input aria-label={`Message ${activeChat.name}`} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message" className="min-w-0 flex-1 rounded-full border border-white/12 bg-transparent px-4 py-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#a95bf4]" />
            <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a95bf4] text-zinc-950 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"><Send size={16} /></button>
          </form>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25"><MessageCircle size={30} strokeWidth={1.4} className="text-zinc-300" /></span>
          <p className="mt-5 text-lg font-semibold text-white">Your messages</p>
          <p className="mt-2 max-w-[30ch] text-xs leading-5 text-zinc-500">Match with someone to unlock a new conversation.</p>
        </div>
      )}
    </div>
  );

  const panel = (mobile = false) => (
    <section aria-label="Matched clubber chats" className="grid h-full min-h-0 overflow-hidden rounded-[22px] border border-white/10 bg-[#0d0d10] shadow-[0_28px_90px_rgba(31,8,46,0.28)] md:grid-cols-[250px_minmax(0,1fr)]">
      {renderInbox(mobile)}
      {renderThread(mobile)}
    </section>
  );

  return (
    <>
      <button type="button" onClick={onOpen} aria-current={isOpen ? "page" : undefined} className={`group flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition active:scale-[0.98] sm:w-12 lg:w-[164px] lg:justify-between lg:px-4 ${isOpen ? "border-[#a95bf4]/65 bg-[#a95bf4] text-black" : "border-transparent text-zinc-300 hover:border-white/10 hover:bg-white/[0.05]"}`}>
        <span className="flex items-center gap-2"><MessageCircle size={16} className={isOpen ? "text-black" : "text-[#c58aff]"} /> <span className="hidden lg:inline">Chats</span></span>
        <span className={`hidden rounded-md px-2 py-1 font-mono text-[10px] font-semibold lg:inline ${isOpen ? "bg-black/15 text-black" : "bg-[#a95bf4] text-black"}`}>{chats.length}</span>
      </button>
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-0 bottom-0 top-20 z-[45] bg-[#070709] p-3 pb-24 sm:py-6 sm:pl-[92px] sm:pr-6 lg:pl-[236px]">
              <motion.div initial={reducedMotion ? false : { y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="relative mx-auto h-full max-w-[1160px]">
                <button type="button" onClick={onClose} aria-label="Return to discover" className="absolute right-3 top-3 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-zinc-400 transition hover:text-white md:flex"><X size={16} /></button>
                {panel(true)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
