"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  event: "",
  vibe: "House",
  capacity: "8",
  description: "",
};

export default function CreateGroupModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const reducedMotion = useReducedMotion();

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.event.trim()) return;
    onCreate(form);
    setForm(initialForm);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Create a nightlife group"
        >
          <motion.form
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            onSubmit={submit}
            className="relative max-h-full w-full max-w-[620px] overflow-y-auto rounded-[20px] bg-[#f3f1f4] p-6 text-black shadow-[0_32px_120px_rgba(77,22,110,0.5)] sm:p-9"
          >
            <button
              type="button"
              aria-label="Close create group form"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform active:scale-95"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#7626ad]">
              New nightlife crew
            </p>
            <h2 className="mt-4 max-w-[440px] text-5xl font-medium leading-[0.9] tracking-[-0.04em] [font-family:var(--font-cormorant)] sm:text-6xl">
              Start with a shared night.
            </h2>
            <p className="mt-4 max-w-[50ch] text-sm leading-6 text-zinc-600">
              Create a group around an event and let the right people find it.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-zinc-700">Group name</span>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="After Dark regulars"
                  className="mt-2 h-12 w-full rounded-[10px] bg-white px-4 text-sm text-black outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-[#7626ad]"
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-zinc-700">Event</span>
                <input
                  required
                  name="event"
                  value={form.event}
                  onChange={update}
                  placeholder="Event name"
                  className="mt-2 h-12 w-full rounded-[10px] bg-white px-4 text-sm text-black outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-[#7626ad]"
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-zinc-700">Vibe</span>
                <select
                  name="vibe"
                  value={form.vibe}
                  onChange={update}
                  className="mt-2 h-12 w-full rounded-[10px] bg-white px-4 text-sm text-black outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-[#7626ad]"
                >
                  <option>House</option>
                  <option>Techno</option>
                  <option>Rooftop</option>
                  <option>Live music</option>
                  <option>Open air</option>
                  <option>Chill</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold text-zinc-700">Maximum members</span>
                <input
                  name="capacity"
                  type="number"
                  min="2"
                  max="30"
                  value={form.capacity}
                  onChange={update}
                  className="mt-2 h-12 w-full rounded-[10px] bg-white px-4 text-sm text-black outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-[#7626ad]"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold text-zinc-700">What is the plan?</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={update}
                  rows="3"
                  placeholder="Tell people what kind of group you are creating."
                  className="mt-2 w-full resize-none rounded-[10px] bg-white px-4 py-3 text-sm leading-6 text-black outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-[#7626ad]"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-full px-6 text-sm font-semibold text-zinc-600 transition hover:text-black active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-12 rounded-full bg-black px-7 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.98]"
              >
                Create group
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
