"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Camera,
  ChevronRight,
  MapPin,
  Music2,
  Settings2,
  Star,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { currentUserProfile } from "@/data/currentUserProfile";
import OverlayPortal from "./OverlayPortal";

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/25 focus:border-[#c58aff] focus:ring-2 focus:ring-[#a95bf4]/20";

function featuredPhoto(profile) {
  return (
    profile.media.find(
      (item) => item.id === profile.featuredMediaId && item.type === "image",
    ) || profile.media.find((item) => item.type === "image")
  );
}

function MediaPreview({ item, sizes = "390px", controls = true }) {
  if (!item) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-600">
        <Camera size={28} strokeWidth={1.5} />
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <video
        src={item.src}
        controls={controls}
        muted={!controls}
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={item.name}
      />
    );
  }

  return (
    <Image
      src={item.src}
      alt={item.name}
      fill
      sizes={sizes}
      unoptimized={item.src.startsWith("blob:") || item.src.startsWith("/api/profile/media/")}
      className="object-cover"
    />
  );
}

export default function ProfilePanel({ compact = false }) {
  const [profile, setProfile] = useState(currentUserProfile);
  const [draft, setDraft] = useState(currentUserProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeMediaId, setActiveMediaId] = useState(
    currentUserProfile.featuredMediaId || currentUserProfile.media[0]?.id || null,
  );
  const [mediaError, setMediaError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const createdUrls = useRef(new Set());
  const reducedMotion = useReducedMotion();

  const activeMedia =
    profile.media.find((item) => item.id === activeMediaId) || profile.media[0];
  const profileFeaturedPhoto = featuredPhoto(profile);

  useEffect(() => {
    const urls = createdUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Profile could not be loaded.");
        if (!active) return;
        setProfile(payload.profile);
        setDraft(payload.profile);
        setActiveMediaId(
          payload.profile.featuredMediaId || payload.profile.media[0]?.id || null,
        );
        setProfileError("");
      } catch (error) {
        if (active) setProfileError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openSettings = () => {
    setDraft(profile);
    setMediaError("");
    setProfileError("");
    setDeletedMediaIds([]);
    setProfileOpen(false);
    setSettingsOpen(true);
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    if (!files.length) return;

    const additions = files.map((file) => {
      const src = URL.createObjectURL(file);
      createdUrls.current.add(src);
      return {
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        type: file.type.startsWith("video/") ? "video" : "image",
        src,
        name: file.name,
        file,
      };
    });
    const nextMedia = [...draft.media, ...additions];
    const photoCount = nextMedia.filter((item) => item.type === "image").length;
    const videoCount = nextMedia.filter((item) => item.type === "video").length;
    const invalidMix = videoCount > 0 && photoCount > 3;

    if (nextMedia.length > 5 || videoCount > 2 || invalidMix) {
      additions.forEach((item) => {
        URL.revokeObjectURL(item.src);
        createdUrls.current.delete(item.src);
      });
      setMediaError(
        "Use up to 5 photos, or a mixed gallery with no more than 3 photos and 2 videos.",
      );
      event.target.value = "";
      return;
    }

    setDraft((current) => ({
      ...current,
      media: nextMedia,
      featuredMediaId:
        current.featuredMediaId ||
        additions.find((item) => item.type === "image")?.id ||
        "",
    }));
    setMediaError("");
    event.target.value = "";
  };

  const removeMedia = (id) => {
    const item = draft.media.find((entry) => entry.id === id);
    if (item && !item.file) {
      setDeletedMediaIds((current) => [...new Set([...current, id])]);
    }
    if (item?.src?.startsWith("blob:")) {
      URL.revokeObjectURL(item.src);
      createdUrls.current.delete(item.src);
    }
    setDraft((current) => {
      const media = current.media.filter((entry) => entry.id !== id);
      const featuredMediaId =
        current.featuredMediaId === id
          ? media.find((entry) => entry.type === "image")?.id || ""
          : current.featuredMediaId;
      return { ...current, media, featuredMediaId };
    });
    setMediaError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setProfileError("");

    try {
      for (const mediaId of deletedMediaIds) {
        const response = await fetch(`/api/profile/media/${encodeURIComponent(mediaId)}`, {
          method: "DELETE",
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Media could not be removed.");
      }

      const selectedFeatured = draft.media.find(
        (item) => item.id === draft.featuredMediaId,
      );
      const profileResponse = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...draft,
          featuredMediaId: selectedFeatured?.file ? "" : draft.featuredMediaId,
        }),
      });
      const profilePayload = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profilePayload.error || "Profile could not be updated.");
      }

      let savedProfile = profilePayload.profile;
      for (const item of draft.media.filter((entry) => entry.file)) {
        const formData = new FormData();
        formData.set("file", item.file);
        formData.set("featured", String(item.id === draft.featuredMediaId));
        const response = await fetch("/api/profile/media", {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Media could not be uploaded.");
        savedProfile = payload.profile;
      }

      createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
      createdUrls.current.clear();
      setProfile(savedProfile);
      setDraft(savedProfile);
      setActiveMediaId(
        savedProfile.featuredMediaId || savedProfile.media[0]?.id || null,
      );
      window.dispatchEvent(
        new CustomEvent("scenemates:profile-updated", {
          detail: { profile: savedProfile },
        }),
      );
      setDeletedMediaIds([]);
      setSettingsOpen(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const photoCount = draft.media.filter((item) => item.type === "image").length;
  const videoCount = draft.media.filter((item) => item.type === "video").length;

  return (
    <>
      <button
        type="button"
        onClick={() => setProfileOpen(true)}
        disabled={loading}
        aria-label="Open your profile"
        className={compact ? "group flex min-h-12 items-center justify-center gap-2 rounded-xl border border-transparent px-3 text-left text-xs font-medium text-zinc-300 transition hover:border-white/10 hover:bg-white/[0.05] active:scale-[0.98] sm:w-12 lg:w-[164px] lg:justify-start lg:px-4" : "group flex w-full max-w-[470px] items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/90 p-3 text-left shadow-[0_18px_55px_rgba(50,10,72,0.25)] transition hover:border-[#c58aff]/55 active:scale-[0.99]"}
      >
        <div className={compact ? "relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-zinc-900" : "relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-900"}>
          <MediaPreview item={profileFeaturedPhoto} sizes="48px" controls={false} />
        </div>
        <div className={compact ? "hidden min-w-0 lg:block" : "min-w-0 flex-1"}>
          <p className="text-xs font-medium text-[#c58aff]">{loading ? "Loading profile" : "Your profile"}</p>
          <p className={compact ? "hidden" : "mt-1 truncate text-sm font-semibold text-white"}>
            {profile.name}, {profile.age} · {profile.city}
          </p>
        </div>
        <ChevronRight
          size={18}
          className={compact ? "ml-auto hidden shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-white lg:block" : "mr-1 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-white"}
        />
      </button>

      <OverlayPortal>
        <AnimatePresence>
          {profileOpen && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setProfileOpen(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="your-profile-title"
              initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
              className="relative max-h-[92dvh] w-full max-w-[880px] overflow-y-auto rounded-t-[22px] border border-white/10 bg-zinc-950 p-4 shadow-[0_36px_120px_rgba(0,0,0,0.65)] sm:rounded-[22px] sm:p-6"
            >
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close your profile"
                className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/85 text-zinc-300 transition hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="grid gap-7 md:grid-cols-[0.95fr_1.05fr] md:items-start">
                <div>
                  <div className="relative mx-auto aspect-[9/16] w-full max-w-[330px] overflow-hidden rounded-2xl bg-zinc-900">
                    <MediaPreview item={activeMedia} sizes="420px" />
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const item = profile.media[index];
                      return item ? (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveMediaId(item.id)}
                          aria-label={`View ${item.name}`}
                          className={`relative aspect-[9/16] overflow-hidden rounded-xl border transition ${
                            activeMedia?.id === item.id
                              ? "border-[#c58aff]"
                              : "border-white/10 hover:border-white/35"
                          }`}
                        >
                          <MediaPreview item={item} sizes="80px" controls={false} />
                        </button>
                      ) : (
                        <div
                          key={`empty-${index}`}
                          aria-hidden="true"
                          className="flex aspect-[9/16] items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-700"
                        >
                          <Camera size={14} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-1 pb-2 pt-2 md:pt-10">
                  <p className="text-xs font-medium text-[#c58aff]">Your profile</p>
                  <h1
                    id="your-profile-title"
                    className="mt-3 text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl"
                  >
                    {profile.name}, {profile.age}
                  </h1>
                  <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin size={14} /> {profile.city}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {profile.gender} · {profile.pronouns}
                  </p>
                  <p className="mt-6 text-sm leading-7 text-zinc-300">{profile.bio}</p>

                  <dl className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <dt className="flex items-center gap-2 text-xs font-medium text-[#c58aff]">
                        <Music2 size={14} /> On repeat
                      </dt>
                      <dd className="mt-2 text-sm leading-5 text-zinc-200">
                        {profile.favoriteSong}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <dt className="flex items-center gap-2 text-xs font-medium text-[#c58aff]">
                        <UserRound size={14} /> Party preferences
                      </dt>
                      <dd className="mt-2 text-sm leading-5 text-zinc-200">
                        {profile.partyGenres}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs leading-5 text-zinc-500">
                    {profile.nightlifeStyle}
                  </p>
                  <button
                    type="button"
                    onClick={openSettings}
                    className="mt-8 flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold text-zinc-200 transition hover:border-[#c58aff]/65 hover:text-white active:scale-[0.98]"
                  >
                    <Settings2 size={15} /> Edit profile
                  </button>
                </div>
              </div>
            </motion.section>
          </motion.div>
          )}
        </AnimatePresence>
      </OverlayPortal>

      <OverlayPortal>
        <AnimatePresence>
          {settingsOpen && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/85 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSettingsOpen(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-settings-title"
              initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.99 }}
              transition={{ duration: reducedMotion ? 0 : 0.22 }}
              className="max-h-[92dvh] w-full max-w-[760px] overflow-y-auto rounded-t-[22px] border border-white/10 bg-zinc-950 shadow-[0_36px_120px_rgba(0,0,0,0.6)] sm:rounded-[22px]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-950/95 px-5 py-4 backdrop-blur-md sm:px-7">
                <div>
                  <h2
                    id="profile-settings-title"
                    className="text-xl font-medium tracking-[-0.035em] text-white"
                  >
                    Profile settings
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Update what other clubbers can see.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  aria-label="Close profile settings"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-white/30 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveProfile} className="space-y-8 p-5 sm:p-7">
                {profileError && (
                  <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-xs leading-5 text-red-200">
                    {profileError}
                  </p>
                )}
                <fieldset>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <legend className="text-sm font-semibold text-white">Profile media</legend>
                      <p className="mt-1 max-w-[52ch] text-xs leading-5 text-zinc-500">
                        Add up to 5 photos. You can also use 2 video slots with up to 3 photos.
                        Choose one photo as featured. It appears first on your profile and in the navbar.
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {photoCount} photos / {videoCount} videos
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const item = draft.media[index];
                      return item ? (
                        <div
                          key={item.id}
                          className={`group relative aspect-[9/16] overflow-hidden rounded-xl border bg-zinc-900 transition ${
                            draft.featuredMediaId === item.id
                              ? "border-[#c58aff]"
                              : "border-white/10"
                          }`}
                        >
                          <MediaPreview item={item} sizes="140px" controls={false} />
                          {item.type === "image" && (
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  featuredMediaId: item.id,
                                }))
                              }
                              aria-pressed={draft.featuredMediaId === item.id}
                              aria-label={
                                draft.featuredMediaId === item.id
                                  ? `${item.name} is your featured photo`
                                  : `Make ${item.name} your featured photo`
                              }
                              className={`absolute inset-x-2 bottom-2 flex min-h-9 items-center justify-center gap-1.5 rounded-full px-2 text-[10px] font-semibold shadow-[0_5px_16px_rgba(0,0,0,0.3)] transition active:scale-[0.97] ${
                                draft.featuredMediaId === item.id
                                  ? "bg-[#a95bf4] text-[#151117]"
                                  : "bg-zinc-950/90 text-zinc-200 hover:bg-white hover:text-zinc-950"
                              }`}
                            >
                              <Star
                                size={12}
                                fill={
                                  draft.featuredMediaId === item.id
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                              {draft.featuredMediaId === item.id
                                ? "Featured"
                                : "Feature"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(item.id)}
                            aria-label={`Delete ${item.name}`}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/90 text-zinc-300 opacity-100 transition hover:bg-red-950 hover:text-red-100 active:scale-[0.96] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <label
                          key={`upload-slot-${index}`}
                          className="flex aspect-[9/16] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.025] text-center text-xs text-zinc-400 transition hover:border-[#c58aff]/70 hover:bg-[#a95bf4]/[0.06] hover:text-white active:scale-[0.98]"
                        >
                          <Upload size={18} />
                          Add media
                          <span className="text-[10px] text-zinc-600">Slot {index + 1}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                            multiple
                            onChange={handleMediaUpload}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                  {mediaError && (
                    <p role="alert" className="mt-3 text-xs leading-5 text-red-300">
                      {mediaError}
                    </p>
                  )}
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-white">About you</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <label className="text-xs font-medium text-zinc-300">
                      Name
                      <input
                        required
                        name="name"
                        value={draft.name}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-zinc-300">
                      Age
                      <input
                        required
                        min="18"
                        max="99"
                        type="number"
                        name="age"
                        value={draft.age}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-zinc-300">
                      Gender
                      <select
                        name="gender"
                        value={draft.gender}
                        onChange={updateField}
                        className={fieldClass}
                      >
                        <option>Man</option>
                        <option>Woman</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-zinc-300">
                      Pronouns
                      <input
                        name="pronouns"
                        value={draft.pronouns}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-zinc-300 sm:col-span-2">
                      City
                      <input
                        required
                        name="city"
                        value={draft.city}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-zinc-300 sm:col-span-2">
                      Bio
                      <textarea
                        required
                        name="bio"
                        value={draft.bio}
                        onChange={updateField}
                        rows={4}
                        maxLength={240}
                        className={`${fieldClass} resize-none`}
                      />
                      <span className="mt-2 block text-right text-[11px] text-zinc-600">
                        {draft.bio.length}/240
                      </span>
                    </label>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-semibold text-white">Your nightlife</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <label className="text-xs font-medium text-zinc-300">
                      Favourite song
                      <input
                        name="favoriteSong"
                        value={draft.favoriteSong}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-zinc-300">
                      Favourite party genres
                      <input
                        name="partyGenres"
                        value={draft.partyGenres}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                    <label className="text-xs font-medium text-zinc-300 sm:col-span-2">
                      Nightlife style
                      <input
                        name="nightlifeStyle"
                        value={draft.nightlifeStyle}
                        onChange={updateField}
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </fieldset>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/35 hover:text-white active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-[#c58aff] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
      </OverlayPortal>
    </>
  );
}
