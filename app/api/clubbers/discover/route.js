import { NextResponse } from "next/server";
import { clubbers as trialClubbers } from "@/data/clubbers";
import { events } from "@/data/events";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { seedTrialData } from "@/lib/chat";
import { getSessionUser } from "@/lib/session";
import Match from "@/models/Match";
import Profile from "@/models/Profile";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function orderedMedia(profile) {
  const media = (profile.media || []).map((item) => ({
    id: item.mediaId,
    type: item.type,
    src: item.src,
    alt: item.alt || `${profile.name}'s profile upload`,
  }));
  const featured =
    media.find(
      (item) =>
        item.id === profile.featuredMediaId && item.type === "image",
    ) || media.find((item) => item.type === "image");
  return featured
    ? [featured, ...media.filter((item) => item.id !== featured.id)]
    : media;
}

export async function GET(request) {
  const limited = enforceRateLimit(request, 80);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    await connectMongo();
    await seedTrialData(user);
    const existingMatches = await Match.find({ userProfileId: user.id })
      .select({ vibedProfileId: 1 })
      .lean();
    const excludedIds = [
      String(user.id),
      ...existingMatches.map((match) => match.vibedProfileId),
    ];
    const profiles = await Profile.find({ profileId: { $nin: excludedIds } })
      .select({
        profileId: 1,
        isCurrentUser: 1,
        name: 1,
        age: 1,
        gender: 1,
        pronouns: 1,
        city: 1,
        distance: 1,
        image: 1,
        media: 1,
        featuredMediaId: 1,
        bio: 1,
        music: 1,
        favoriteSong: 1,
        partyGenres: 1,
        nightlifeStyle: 1,
        interests: 1,
        vibe: 1,
        events: 1,
        compatibility: 1,
      })
      .lean();

    const eventLookup = new Map(events.map((event) => [event.id, event]));
    const trialLookup = new Map(
      trialClubbers.map((profile) => [String(profile.id), profile]),
    );
    const discoverable = profiles
      .map((profile) => {
        const media = orderedMedia(profile);
        const featured = media.find((item) => item.type === "image");
        const primaryEvent = profile.events?.[0];
        const event = primaryEvent ? eventLookup.get(primaryEvent.eventId) : null;
        const trialProfile = trialLookup.get(profile.profileId);
        return {
          id: profile.profileId,
          name: profile.name,
          age: profile.age || 18,
          gender: profile.gender || "Prefer not to say",
          pronouns: profile.pronouns || "",
          city: profile.city || "Mumbai",
          distance: profile.distance || "Nearby",
          image: featured?.src || profile.image || "",
          media,
          bio: profile.bio || "",
          music: profile.music || [],
          favoriteSong: profile.favoriteSong || "",
          partyGenres:
            profile.partyGenres || (profile.music || []).join(", "),
          nightlifeStyle: profile.nightlifeStyle || profile.vibe || "",
          interests: profile.interests || [],
          vibe: profile.vibe || profile.nightlifeStyle || "",
          events: profile.events || [],
          event: event?.shortTitle || event?.title || "SceneMates night",
          eventId: primaryEvent?.eventId || null,
          eventDate: event?.date || "UPCOMING",
          eventStatus: primaryEvent?.status || "interested",
          compatibility: profile.compatibility || 80,
          willMatch: trialProfile?.willMatch ?? true,
        };
      })
      .filter((profile) => profile.image && profile.bio);

    return NextResponse.json({ clubbers: discoverable });
  } catch (error) {
    logServerError("Discover clubbers failed", error);
    return NextResponse.json(
      { error: "Clubber profiles could not be loaded." },
      { status: 500 },
    );
  }
}
