"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, RotateCcw, X } from "lucide-react";

export default function MatchModal({ clubber, onClose, onStartChat }) {
  return (
    <AnimatePresence>
      {clubber && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`Match with ${clubber.name}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-full max-w-[520px] overflow-hidden rounded-[22px] bg-[#f4f1f5] p-7 text-black shadow-[0_32px_120px_rgba(88,27,127,0.5)] sm:p-10"
          >
            <button
              type="button"
              aria-label="Close match"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform active:scale-95"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7626ad]">
              You both vibed
            </p>
            <h2 className="mt-5 max-w-[380px] text-5xl font-medium leading-[0.88] tracking-[-0.045em] [font-family:var(--font-cormorant)] sm:text-7xl">
              You vibed.
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-6 text-zinc-600 sm:text-base">
              You and {clubber.name} share {clubber.sharedEvent || clubber.event}.
              Start a conversation and make a plan.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-200">
                <Image
                  src={clubber.image}
                  alt={clubber.name}
                  fill
                  sizes="64px"
                  unoptimized={clubber.image.startsWith("/api/profile/media/")}
                  className="object-cover"
                />
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#a95bf4] text-lg font-bold text-black">
                YOU
              </div>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onStartChat(clubber)}
                className="group flex min-h-[58px] cursor-pointer items-center justify-center gap-3 rounded-full border border-[#17131a] bg-[#17131a] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(23,19,26,0.22)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#27202c] hover:shadow-[0_12px_28px_rgba(23,19,26,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7626ad] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1f5] active:translate-y-0 active:scale-[0.98]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a95bf4] text-[#17131a] transition-transform duration-200 group-hover:scale-105">
                  <MessageCircle size={16} strokeWidth={2} />
                </span>
                <span>Send a message</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="group flex min-h-[58px] cursor-pointer items-center justify-center gap-3 rounded-full border-2 border-[#17131a]/20 bg-[#fbfafb] px-5 text-sm font-semibold text-[#17131a] shadow-[0_5px_16px_rgba(23,19,26,0.08)] transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[#7626ad]/55 hover:bg-white hover:shadow-[0_10px_24px_rgba(66,28,87,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7626ad] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f1f5] active:translate-y-0 active:scale-[0.98]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[#17131a] transition-colors duration-200 group-hover:bg-[#ead9f4] group-hover:text-[#7626ad]">
                  <RotateCcw size={16} strokeWidth={2} />
                </span>
                <span>Keep swiping</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
