"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { label: "Events", href: "/events" },
  { label: "Clubbers", href: "/clubbers" },
  { label: "Groups", href: "/groups" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-50 h-20">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto grid h-20 max-w-[1920px] grid-cols-[1fr_auto] items-center px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10"
      >
        <div className="hidden items-center gap-7 lg:flex xl:gap-10">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-300 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          aria-label="SceneMates home"
          className="justify-self-start text-xl font-medium tracking-[-0.045em] text-white sm:text-2xl lg:justify-self-center"
        >
          SceneMates
        </Link>

        <div className="flex items-center justify-self-end gap-3 sm:gap-6">
          <Link
            href="/events"
            className="hidden font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-200 transition-colors duration-200 hover:text-white sm:block"
          >
            Explore Events
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-200 transition-colors duration-200 hover:text-white"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="bg-black/90 backdrop-blur-md">
          <div className="mx-auto grid max-w-[1920px] px-5 py-2 sm:px-8 lg:grid-cols-3 lg:px-10">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-5 font-mono text-xs uppercase tracking-[0.14em] text-zinc-300 transition hover:text-white lg:px-5"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-zinc-600">
                  0{index + 1}
                </span>
              </Link>
            ))}
            <Link
              href="/events"
              onClick={() => setMenuOpen(false)}
              className="my-5 flex h-12 items-center justify-center font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white sm:hidden"
            >
              Explore Events
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
