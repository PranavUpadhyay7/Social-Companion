import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { getAccessContext, hasRole } from "@/lib/access";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import CheckIn from "@/models/CheckIn";
import Event from "@/models/Event";
import GuestEntry from "@/models/GuestEntry";

export async function GET(request) {
  const limited = enforceRateLimit(request, 120);
  if (limited) return limited;
  const access = await getAccessContext();
  if (!access) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const url = new URL(request.url);
  const eventId = Number(url.searchParams.get("eventId"));
  const query = String(url.searchParams.get("query") || "").trim().slice(0, 120);
  await connectMongo();
  if (!Number.isSafeInteger(eventId)) {
    const eventFilter = hasRole(access, "platform_admin")
      ? { status: { $in: ["Venue Confirmed", "Published"] } }
      : { $or: [{ ownerProfileId: access.profileId }, { eventId: { $in: [...access.assignedEventIds] } }] };
    const events = await Event.find(eventFilter).sort({ dateISO: 1 }).limit(50).lean();
    return NextResponse.json({ events: events.map((event) => ({ eventId: event.eventId, title: event.title, venue: event.venue, dateISO: event.dateISO })) });
  }
  if (query.length < 2) return NextResponse.json({ results: [] });
  const event = await Event.findOne({ eventId }).lean();
  const authorized = event?.ownerProfileId === access.profileId || access.assignedEventIds.has(eventId) || hasRole(access, "platform_admin");
  if (!authorized) return NextResponse.json({ error: "You are not assigned to this event." }, { status: 403 });
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const results = await GuestEntry.find({ eventId, $or: [{ guestName: { $regex: escaped, $options: "i" } }, { passId: query.toUpperCase() }] }).limit(20).lean();
  return NextResponse.json({ results: results.map((entry) => ({ id: entry._id.toString(), guestName: entry.guestName, passId: entry.passId, status: entry.status, checkInStatus: entry.checkInStatus, plusOnes: entry.plusOnes })) });
}

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 60);
  if (limited) return limited;
  const access = await getAccessContext();
  if (!access) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  const eventId = Number(body.eventId);
  await connectMongo();
  const event = await Event.findOne({ eventId }).lean();
  const authorized = event?.ownerProfileId === access.profileId || access.assignedEventIds.has(eventId) || hasRole(access, "platform_admin");
  if (!authorized) return NextResponse.json({ error: "You are not assigned to this event." }, { status: 403 });
  const entry = body.guestEntryId
    ? await GuestEntry.findOne({ _id: body.guestEntryId, eventId })
    : await GuestEntry.findOne({ passId: String(body.passId || "").trim().toUpperCase(), eventId });
  if (!entry) return NextResponse.json({ result: "invalid", error: "No matching pass was found." }, { status: 404 });
  if (entry.status === "Cancelled") return NextResponse.json({ result: "cancelled", error: "This pass was cancelled." }, { status: 409 });
  if (entry.checkInStatus === "Checked In") return NextResponse.json({ result: "already_used", checkedInAt: entry.checkedInAt }, { status: 409 });
  if (!["Approved", "Confirmed"].includes(entry.status) || !entry.passId) return NextResponse.json({ result: "invalid", error: "This guest is not confirmed for entry." }, { status: 409 });
  try {
    const now = new Date();
    await CheckIn.create({ eventId, guestEntryId: entry._id, passId: entry.passId, checkedInByProfileId: access.profileId, method: body.method === "qr_input" ? "qr_input" : body.guestEntryId ? "search" : "pass_id", checkedInAt: now });
    entry.status = "Checked In";
    entry.checkInStatus = "Checked In";
    entry.checkedInAt = now;
    await entry.save();
    return NextResponse.json({ result: "valid", checkedInAt: now, guest: { guestName: entry.guestName, plusOnes: entry.plusOnes, passId: entry.passId } });
  } catch (error) {
    if (error?.code === 11000) return NextResponse.json({ result: "already_used", error: "This pass has already been used." }, { status: 409 });
    throw error;
  }
}
