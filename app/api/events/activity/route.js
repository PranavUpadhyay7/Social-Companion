import { NextResponse } from "next/server";
import { events } from "@/data/events";
import { connectMongo } from "@/lib/mongodb";
import {
  enforceRateLimit,
  rejectBodyOverLimit,
  rejectCrossOrigin,
} from "@/lib/apiSecurity";
import { getAuthenticatedProfile } from "@/lib/profile";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeActivity(profile) {
  return Object.fromEntries(
    (profile.events || []).map((entry) => [String(entry.eventId), entry.status]),
  );
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
    const profile = await getAuthenticatedProfile(user);
    return NextResponse.json({ activity: serializeActivity(profile) });
  } catch (error) {
    logServerError("Event activity load failed", error);
    return NextResponse.json({ error: "Event choices could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const eventId = Number(body.eventId);
    const status = body.status;
    if (!Number.isInteger(eventId) || !events.some((event) => event.id === eventId)) {
      return NextResponse.json({ error: "Choose a valid event." }, { status: 400 });
    }
    if (!new Set(["interested", "going"]).has(status)) {
      return NextResponse.json({ error: "Choose interested or going." }, { status: 400 });
    }

    await connectMongo();
    const profile = await getAuthenticatedProfile(user);
    profile.events = (profile.events || []).filter((entry) => entry.eventId !== eventId);
    profile.events.push({ eventId, status });
    await profile.save();

    return NextResponse.json({ activity: serializeActivity(profile) });
  } catch (error) {
    logServerError("Event activity update failed", error);
    return NextResponse.json({ error: "Event choice could not be saved." }, { status: 500 });
  }
}
