import Profile from "@/models/Profile";
import { seedTrialData } from "@/lib/chat";

export async function getAuthenticatedProfile(user) {
  await seedTrialData(user);
  return Profile.findOne({ profileId: String(user.id) });
}

export function serializeProfile(profile) {
  const media = (profile.media || []).map((item) => ({
    id: item.mediaId,
    type: item.type,
    src: item.src,
    name: item.alt || "Profile upload",
  }));
  const featuredMedia =
    media.find(
      (item) =>
        item.id === profile.featuredMediaId && item.type === "image",
    ) || media.find((item) => item.type === "image");
  const orderedMedia = featuredMedia
    ? [featuredMedia, ...media.filter((item) => item.id !== featuredMedia.id)]
    : media;

  return {
    name: profile.name,
    age: profile.age || 18,
    gender: profile.gender || "Prefer not to say",
    pronouns: profile.pronouns || "",
    city: profile.city || "Mumbai",
    bio: profile.bio || "",
    favoriteSong: profile.favoriteSong || "",
    partyGenres:
      profile.partyGenres || (profile.music || []).filter(Boolean).join(", "),
    nightlifeStyle: profile.nightlifeStyle || profile.vibe || "",
    featuredMediaId: featuredMedia?.id || "",
    featuredImage: featuredMedia?.src || profile.image || "",
    media: orderedMedia,
  };
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function validateProfileUpdate(body) {
  const age = Number(body.age);
  const profile = {
    name: cleanText(body.name, 60),
    age,
    gender: cleanText(body.gender, 40),
    pronouns: cleanText(body.pronouns, 30),
    city: cleanText(body.city, 100),
    bio: cleanText(body.bio, 500),
    favoriteSong: cleanText(body.favoriteSong, 120),
    partyGenres: cleanText(body.partyGenres, 180),
    nightlifeStyle: cleanText(body.nightlifeStyle, 180),
    featuredMediaId: cleanText(body.featuredMediaId, 120),
  };

  if (!profile.name || !profile.city || !profile.bio) {
    return { error: "Name, city and bio are required." };
  }
  if (!Number.isInteger(age) || age < 18 || age > 99) {
    return { error: "Age must be between 18 and 99." };
  }

  return { profile };
}
