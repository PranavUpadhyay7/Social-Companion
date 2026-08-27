import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  enforceRateLimit,
  rejectBodyOverLimit,
  rejectCrossOrigin,
} from "@/lib/apiSecurity";
import {
  getAuthenticatedProfile,
  serializeProfile,
  validateProfileUpdate,
} from "@/lib/profile";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const limited = enforceRateLimit(request, 80);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    await connectMongo();
    const profile = await getAuthenticatedProfile(user);
    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (error) {
    logServerError("Profile load failed", error);
    return NextResponse.json({ error: "Profile could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 20);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json();
    const validated = validateProfileUpdate(body);
    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    await connectMongo();
    const profile = await getAuthenticatedProfile(user);
    const { featuredMediaId, ...profileFields } = validated.profile;
    Object.assign(profile, profileFields);
    const featuredMedia = featuredMediaId
      ? profile.media.find(
          (item) => item.mediaId === featuredMediaId && item.type === "image",
        )
      : profile.media.find((item) => item.type === "image");
    if (featuredMediaId && !featuredMedia) {
      return NextResponse.json(
        { error: "Choose one of your uploaded photos as the featured photo." },
        { status: 400 },
      );
    }
    profile.featuredMediaId = featuredMedia?.mediaId || "";
    profile.image = featuredMedia?.src || "";
    profile.music = validated.profile.partyGenres
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 10);
    profile.vibe = validated.profile.nightlifeStyle;
    await profile.save();

    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (error) {
    logServerError("Profile update failed", error);
    return NextResponse.json({ error: "Profile could not be updated." }, { status: 500 });
  }
}
