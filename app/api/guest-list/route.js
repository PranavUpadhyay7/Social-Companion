import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { getAuthenticatedProfile } from "@/lib/profile";
import { getSessionUser } from "@/lib/session";
import Event from "@/models/Event";
import GuestEntry from "@/models/GuestEntry";
import Profile from "@/models/Profile";

const STATUSES = new Set(["Pending", "Approved", "Payment Required", "Confirmed", "Checked In", "Declined", "Cancelled"]);
const SOURCES = new Set(["public_request", "promoter_invitation", "platform_user"]);

function publicGuest(entry) {
  return {
    id: entry._id.toString(),
    guestName: entry.guestName,
    phoneVerified: entry.phoneVerified,
    plusOnes: entry.plusOnes,
    source: entry.source,
    status: entry.status,
    paymentStatus: entry.paymentStatus,
    checkInStatus: entry.checkInStatus,
    passId: entry.passId || "",
    createdAt: entry.createdAt,
  };
}

export async function GET(request) {
  const limited = enforceRateLimit(request, 80);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const eventId = Number(new URL(request.url).searchParams.get("eventId"));
  if (!Number.isSafeInteger(eventId)) return NextResponse.json({ error: "Choose an event." }, { status: 400 });
  await connectMongo();
  const event = await Event.findOne({ eventId, ownerProfileId: String(user.id) }).lean();
  if (!event) return NextResponse.json({ error: "Only the event promoter can view this guest list." }, { status: 403 });
  const userSearch = new URL(request.url).searchParams.get("userSearch")?.trim();
  if (userSearch && userSearch.length >= 2) {
    const escaped = userSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const profiles = await Profile.find({ name: { $regex: escaped, $options: "i" }, profileId: { $ne: String(user.id) } }).select("profileId name city image").limit(8).lean();
    return NextResponse.json({ users: profiles.map((profile) => ({ profileId: profile.profileId, name: profile.name, city: profile.city || "", image: profile.image || "" })) });
  }
  const guests = await GuestEntry.find({ eventId }).sort({ createdAt: -1 }).select("+notes").lean();
  const metrics = Object.fromEntries(STATUSES.values().map((status) => [status, 0]));
  guests.forEach((guest) => { metrics[guest.status] = (metrics[guest.status] || 0) + 1; });
  return NextResponse.json({
    event: { eventId, title: event.title, capacity: event.guestListSettings?.capacity || event.capacity, settings: event.guestListSettings },
    metrics,
    guests: guests.map((entry) => ({ ...publicGuest(entry), notes: entry.notes || "" })),
  });
}

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 16 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 12);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login or register to join a guest list." }, { status: 401 });
  const body = await request.json();
  const eventId = Number(body.eventId);
  const source = SOURCES.has(body.source) ? body.source : "public_request";
  if (!Number.isSafeInteger(eventId)) return NextResponse.json({ error: "Choose an event." }, { status: 400 });
  await connectMongo();
  const event = await Event.findOne({ eventId });
  if (!event || event.venueConfirmation?.state !== "approved" || !event.guestListSettings?.enabled) {
    return NextResponse.json({ error: "This guest list is not available yet." }, { status: 409 });
  }
  const isOwner = event.ownerProfileId === String(user.id);
  if (source !== "public_request" && !isOwner) {
    return NextResponse.json({ error: "Only the event promoter can invite guests." }, { status: 403 });
  }
  const profile = await getAuthenticatedProfile(user);
  let targetProfileId = "";
  if (source === "platform_user") {
    targetProfileId = String(body.targetProfileId || "").slice(0, 120);
    const targetProfile = await Profile.findOne({ profileId: targetProfileId }).select("profileId name").lean();
    if (!targetProfile) return NextResponse.json({ error: "Choose an existing platform user." }, { status: 400 });
  }
  const guestName = String(body.guestName || profile.name || "").trim().slice(0, 100);
  if (!guestName) return NextResponse.json({ error: "Guest name is required." }, { status: 400 });
  const plusOnes = Math.max(0, Math.min(Number(body.plusOnes) || 0, event.guestListSettings.plusOneAllowance || 0));
  const confirmedCount = await GuestEntry.countDocuments({ eventId, status: { $in: ["Approved", "Confirmed", "Checked In"] } });
  if (confirmedCount + 1 + plusOnes > event.guestListSettings.capacity) {
    return NextResponse.json({ error: "The guest list has reached capacity." }, { status: 409 });
  }
  if (source === "public_request") {
    const duplicate = await GuestEntry.findOne({ eventId, userProfileId: String(user.id), status: { $nin: ["Declined", "Cancelled"] } });
    if (duplicate) return NextResponse.json({ error: "You already have an active request for this event." }, { status: 409 });
  }
  const status = source === "public_request" ? "Pending" : (event.guestListSettings.entryType === "Payment Required" ? "Payment Required" : "Approved");
  const entry = await GuestEntry.create({
    eventId,
    promoterProfileId: event.ownerProfileId,
    userProfileId: source === "promoter_invitation" ? "" : source === "platform_user" ? targetProfileId : String(user.id),
    source,
    referralCode: String(body.referralCode || event.guestListSettings.referralCode || "").slice(0, 80),
    guestName,
    phone: String(body.phone || "").replace(/[^+\d]/g, "").slice(0, 20),
    phoneVerified: false,
    plusOnes,
    status,
    paymentStatus: event.guestListSettings.entryType === "Payment Required" ? "Pending" : "Not Required",
    notes: isOwner ? String(body.notes || "").trim().slice(0, 500) : "",
  });
  return NextResponse.json({ guest: publicGuest(entry), message: source === "public_request" ? "Guest-list request received. Entry conditions still apply after approval." : "Guest added. No external message was sent." }, { status: 201 });
}

export async function PATCH(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 24 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  const eventId = Number(body.eventId);
  const ids = Array.isArray(body.guestIds) ? body.guestIds.slice(0, 100) : [];
  const status = body.status;
  if (!Number.isSafeInteger(eventId) || !STATUSES.has(status) || ids.length === 0) {
    return NextResponse.json({ error: "Choose guests and a valid status." }, { status: 400 });
  }
  await connectMongo();
  const event = await Event.findOne({ eventId, ownerProfileId: String(user.id) });
  if (!event) return NextResponse.json({ error: "Only the event promoter can manage this guest list." }, { status: 403 });
  const entries = await GuestEntry.find({ _id: { $in: ids }, eventId });
  for (const entry of entries) {
    entry.status = status;
    if (["Approved", "Confirmed"].includes(status) && !entry.passId) {
      entry.passId = `SM-${eventId}-${randomBytes(12).toString("hex").toUpperCase()}`;
      entry.passValueHash = createHash("sha256").update(entry.passId).digest("hex");
      entry.arrivalDeadline = event.guestListSettings.closesAt || null;
    }
    if (status === "Cancelled") entry.cancelledAt = new Date();
    await entry.save();
  }
  return NextResponse.json({ updated: entries.length, guests: entries.map(publicGuest), message: `${entries.length} guest record${entries.length === 1 ? "" : "s"} updated.` });
}
