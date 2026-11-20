import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { ensureRole } from "@/lib/access";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";
import PromoterProfile from "@/models/PromoterProfile";
import Event from "@/models/Event";
import GuestEntry from "@/models/GuestEntry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeUrl(value) {
  const cleaned = clean(value, 500);
  if (!cleaned) return "";
  try {
    const url = new URL(cleaned);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeInstagram(value) {
  const input = clean(value, 160);
  if (!input) return null;
  let handle = input.replace(/^@/, "");
  if (/^https?:\/\//i.test(handle)) {
    try {
      const url = new URL(handle);
      if (!["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase())) return null;
      handle = url.pathname.split("/").filter(Boolean)[0] || "";
    } catch { return null; }
  } else {
    handle = handle.replace(/^(?:www\.)?instagram\.com\//i, "").split("/")[0];
  }
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) return null;
  return `https://www.instagram.com/${handle}/`;
}

function serialize(profile, stats = {}) {
  return {
    id: profile._id?.toString(),
    accountType: profile.accountType,
    fullName: profile.fullName,
    displayName: profile.displayName,
    emailStatus: profile.emailStatus,
    phone: profile.phone || "",
    phoneStatus: profile.phoneStatus,
    identityStatus: profile.identityStatus,
    livenessStatus: profile.livenessStatus,
    businessRegistration: profile.businessRegistration,
    bankStatus: profile.bankStatus,
    website: profile.website,
    instagram: profile.instagram,
    previousEvents: profile.previousEvents || [],
    venueReferences: profile.venueReferences || [],
    completedEventCount: stats.completedEventCount || 0,
    totalAttendees: stats.totalAttendees || 0,
    createdAt: profile.createdAt,
  };
}

export async function GET(request) {
  const limited = enforceRateLimit(request, 60);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  try {
    await connectMongo();
    const ownerProfileId = String(user.id);
    const profile = await PromoterProfile.findOne({ ownerProfileId }).lean();
    if (!profile) return NextResponse.json({ promoter: null });
    const completedEvents = await Event.find({ ownerProfileId, status: "Completed" }).select("eventId").lean();
    const completedIds = completedEvents.map((event) => event.eventId);
    const totalAttendees = completedIds.length ? await GuestEntry.countDocuments({ eventId: { $in: completedIds }, checkInStatus: "Checked In" }) : 0;
    return NextResponse.json({ promoter: serialize(profile, { completedEventCount: completedIds.length, totalAttendees }) });
  } catch (error) {
    logServerError("Promoter profile load failed", error);
    return NextResponse.json({ error: "Promoter profile could not be loaded." }, { status: 500 });
  }
}

export async function PUT(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 64 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 20);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await request.json();
    const accountType = body.accountType === "business" ? "business" : "personal";
    const fullName = clean(body.fullName, 100);
    const displayName = clean(body.displayName, 120);
    const phone = clean(body.phone, 20).replace(/[^+\d]/g, "");
    const instagram = normalizeInstagram(body.instagram);
    if (!fullName || !displayName) {
      return NextResponse.json({ error: "Full name and promoter name are required." }, { status: 400 });
    }
    if (phone && !/^\+?[1-9]\d{7,14}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number with country code." }, { status: 400 });
    }
    if (!instagram) return NextResponse.json({ error: "Connect a valid public Instagram profile to create a promoter profile." }, { status: 400 });

    await connectMongo();
    const promoter = await PromoterProfile.findOneAndUpdate(
      { ownerProfileId: String(user.id) },
      {
        $set: {
          accountType,
          fullName,
          displayName,
          emailStatus: "verified",
          phone,
          phoneStatus: phone ? "verified" : "unverified",
          businessRegistration: accountType === "business" ? clean(body.businessRegistration, 120) : "",
          taxIdentifier: accountType === "business" ? clean(body.taxIdentifier, 40) : "",
          website: safeUrl(body.website),
          instagram,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    await ensureRole(String(user.id), "promoter");
    const completedEvents = await Event.find({ ownerProfileId: String(user.id), status: "Completed" }).select("eventId").lean();
    const completedIds = completedEvents.map((event) => event.eventId);
    const totalAttendees = completedIds.length ? await GuestEntry.countDocuments({ eventId: { $in: completedIds }, checkInStatus: "Checked In" }) : 0;
    return NextResponse.json({ promoter: serialize(promoter, { completedEventCount: completedIds.length, totalAttendees }), message: "Promoter profile saved." });
  } catch (error) {
    logServerError("Promoter profile save failed", error);
    return NextResponse.json({ error: "Promoter details could not be saved." }, { status: 500 });
  }
}
