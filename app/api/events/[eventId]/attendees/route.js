import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import GuestEntry from "@/models/GuestEntry";
import Profile from "@/models/Profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicProfile(profile) {
  return {
    id: profile.profileId,
    name: profile.name,
    age: profile.age || null,
    image: profile.image || "",
    music: (profile.music || []).slice(0, 2),
  };
}

export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, 60);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { eventId: rawEventId } = await params;
  const eventId = Number(rawEventId);
  if (!Number.isSafeInteger(eventId) || eventId <= 0) {
    return NextResponse.json({ error: "Choose a valid event." }, { status: 400 });
  }

  await connectMongo();
  const [interestedProfiles, confirmedEntries] = await Promise.all([
    Profile.find({ events: { $elemMatch: { eventId, status: "interested" } } })
      .select("profileId name age image music")
      .limit(100)
      .lean(),
    GuestEntry.find({
      eventId,
      userProfileId: { $ne: "" },
      $or: [
        { paymentStatus: "Paid" },
        { status: { $in: ["Confirmed", "Checked In"] } },
      ],
    })
      .select("userProfileId")
      .limit(100)
      .lean(),
  ]);
  const goingIds = [...new Set(confirmedEntries.map((entry) => entry.userProfileId))];
  const goingProfiles = goingIds.length
    ? await Profile.find({ profileId: { $in: goingIds } })
        .select("profileId name age image music")
        .limit(100)
        .lean()
    : [];

  return NextResponse.json({
    interested: interestedProfiles.map(publicProfile),
    going: goingProfiles.map(publicProfile),
  });
}
