"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, HeartOff, MessageCircle, X } from "lucide-react";
import OverlayPortal from "./OverlayPortal";

export default function MatchesPanel({ chats, onOpenChat, onUnvibe }) {
  const [open, setOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [unvibingId, setUnvibingId] = useState(null);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();

  const removeVibe = async (chat) => {
    setUnvibingId(chat.id);
    setError("");
    const removed = await onUnvibe(chat.profileId);
    setUnvibingId(null);
    if (removed) {
      setConfirmingId(null);
      return;
    }
    setError(`Could not unvibe with ${chat.name}. Please try again.`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-h-12 items-center justify-center gap-2 rounded-xl border border-transparent px-3 text-xs font-medium text-zinc-300 transition hover:border-white/10 hover:bg-white/[0.05] active:scale-[0.98] sm:w-12 lg:w-[164px] lg:justify-between lg:px-4"
      >
        <span className="flex items-center gap-2">
          <Heart size={16} className="text-[#c58aff]" />
          <span className="hidden lg:inline">Vibed With</span>
        </span>
        <span className="hidden rounded-md bg-white/[0.08] px-2 py-1 font-mono text-[10px] text-zinc-400 lg:inline">
          {chats.length}
        </span>
      </button>

      <OverlayPortal>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[76] flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-md sm:items-center sm:p-5"
              onMouseDown={(event) =>
                event.target === event.currentTarget && setOpen(false)
              }
            >
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby="matches-title"
                initial={reducedMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                className="relative max-h-[86dvh] w-full max-w-[760px] overflow-y-auto rounded-t-[22px] border border-white/10 bg-[#0d0d10] p-5 shadow-[0_30px_100px_rgba(20,4,31,0.7)] sm:rounded-[22px] sm:p-8"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close Vibed With"
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-white/30 hover:text-white active:scale-[0.96]"
                >
                  <X size={16} />
                </button>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c58aff]">
                  Mutual interest
                </p>
                <h2
                  id="matches-title"
                  className="mt-3 text-3xl font-medium tracking-[-0.045em] text-white"
                >
                  Vibed With
                </h2>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Open a chat or remove a connection you no longer want.
                </p>

                {error && (
                  <p
                    role="alert"
                    className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs text-red-200"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {chats.length ? (
                    chats.map((chat) => (
                      <article
                        key={chat.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10">
                            <Image
                              src={chat.image}
                              alt=""
                              fill
                              sizes="48px"
                              unoptimized={chat.image.startsWith("/api/profile/media/")}
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-white">
                              {chat.name}
                            </span>
                            <span className="mt-1 block truncate text-[11px] text-zinc-500">
                              Vibed for {chat.event}
                            </span>
                          </span>
                        </div>

                        {confirmingId === chat.id ? (
                          <div className="mt-3 rounded-xl bg-red-400/[0.06] p-3">
                            <p className="text-xs leading-5 text-zinc-300">
                              This removes the vibe and your chat history with {chat.name}.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmingId(null)}
                                disabled={unvibingId === chat.id}
                                className="min-h-10 rounded-full border border-white/15 px-3 text-xs font-semibold text-zinc-200 transition hover:border-white/35 active:scale-[0.98] disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => removeVibe(chat)}
                                disabled={unvibingId === chat.id}
                                className="min-h-10 rounded-full bg-red-200 px-3 text-xs font-semibold text-red-950 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                              >
                                {unvibingId === chat.id ? "Removing" : "Confirm Unvibe"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-[1fr_0.72fr] gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onOpenChat(chat.id);
                                setOpen(false);
                              }}
                              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#a95bf4] px-4 text-xs font-semibold text-[#151117] transition hover:bg-[#c58aff] active:scale-[0.98]"
                            >
                              <MessageCircle size={15} /> Open chat
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(chat.id)}
                              aria-label={`Unvibe with ${chat.name}`}
                              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-3 text-xs font-semibold text-zinc-400 transition hover:border-red-300/50 hover:bg-red-400/[0.06] hover:text-red-200 active:scale-[0.98]"
                            >
                              <HeartOff size={15} /> Unvibe
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="py-12 text-center text-sm text-zinc-500 sm:col-span-2">
                      People you vibe with will appear here.
                    </p>
                  )}
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </OverlayPortal>
    </>
  );
}
