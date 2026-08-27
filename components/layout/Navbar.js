"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const links = [
  { label: "Events", href: "/events" },
  { label: "Clubbers", href: "/clubbers" },
  { label: "Groups", href: "/groups" },
];

export default function Navbar({ user = null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountProfile, setAccountProfile] = useState(user);
  const pathname = usePathname();
  const onAuthPage = pathname?.startsWith("/auth");
  const callbackPath = onAuthPage ? "/clubbers" : pathname || "/clubbers";
  const authHref = `/auth?callbackUrl=${encodeURIComponent(callbackPath)}`;

  useEffect(() => {
    setAccountProfile(user);
    if (!user) return undefined;

    let active = true;
    const updateFromProfile = (profile) => {
      if (!profile || !active) return;
      setAccountProfile((current) => ({
        ...current,
        name: profile.name || current?.name,
        image: profile.featuredImage || current?.image,
      }));
    };
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        updateFromProfile(payload.profile);
      } catch {
        // The Google profile remains available if the member profile is offline.
      }
    };
    const handleProfileUpdate = (event) => updateFromProfile(event.detail?.profile);
    window.addEventListener("scenemates:profile-updated", handleProfileUpdate);
    loadProfile();
    return () => {
      active = false;
      window.removeEventListener("scenemates:profile-updated", handleProfileUpdate);
    };
  }, [user]);

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

        <div className="relative flex items-center justify-self-end gap-3 sm:gap-6">
          <Link
            href="/events"
            className="hidden font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-200 transition-colors duration-200 hover:text-white sm:block"
          >
            Explore Events
          </Link>
          {accountProfile ? (
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((current) => !current)}
              className="flex h-9 items-center gap-2 rounded-full border border-white/15 bg-[#0b0b0e]/85 p-1 pr-3 text-xs font-medium text-zinc-200 transition hover:border-[#c58aff]/60 active:scale-[0.98]"
            >
              <span className="relative h-7 w-7 overflow-hidden rounded-full bg-zinc-800">
                {accountProfile.image ? (
                  <Image
                    src={accountProfile.image}
                    alt=""
                    fill
                    sizes="28px"
                    unoptimized={accountProfile.image.startsWith("/api/profile/media/")}
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-[#d8b4fe]">
                    {accountProfile.name?.slice(0, 1).toUpperCase() || "S"}
                  </span>
                )}
              </span>
              <span className="hidden max-w-24 truncate sm:block">{accountProfile.name}</span>
            </button>
          ) : !onAuthPage ? (
            <Link
              href={authHref}
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8b4fe] transition hover:text-white"
            >
              Login / Register
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-200 transition-colors duration-200 hover:text-white"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          {accountProfile && accountOpen && (
            <div className="absolute right-0 top-12 w-52 rounded-xl border border-white/10 bg-[#0b0b0e] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
              <Link
                href="/clubbers"
                onClick={() => setAccountOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Clubbers profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
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
            {!user && !onAuthPage && (
              <Link
                href={authHref}
                onClick={() => setMenuOpen(false)}
                className="my-2 flex min-h-12 items-center justify-center rounded-full border border-[#c58aff]/40 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8b4fe] sm:hidden"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
