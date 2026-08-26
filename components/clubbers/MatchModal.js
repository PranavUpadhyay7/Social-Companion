"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function MatchModal({ clubber, onClose }) {
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
              Mutual interest
            </p>
            <h2 className="mt-5 max-w-[380px] text-5xl font-medium leading-[0.88] tracking-[-0.045em] [font-family:var(--font-cormorant)] sm:text-7xl">
              It&apos;s a match.
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-6 text-zinc-600 sm:text-base">
              You and {clubber.name} are both interested in {clubber.event}.
              Start a conversation and make a plan.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-200">
                <Image
                  src={clubber.image}
                  alt={clubber.name}
                  fill
                  sizes="64px"
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
                className="flex h-13 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                <MessageCircle size={17} /> Send a message
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-13 rounded-full border border-black/20 px-5 text-sm font-semibold text-black transition-transform active:scale-[0.98]"
              >
                Keep swiping
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
