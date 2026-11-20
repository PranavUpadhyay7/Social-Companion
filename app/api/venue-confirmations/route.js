import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { getAccessContext, hasRole } from "@/lib/access";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import Event from "@/models/Event";

export async function GET(request) {
  const limited = enforceRateLimit(request, 60);
  if (limited) return limited;
  const access = await getAccessContext();
  if (!access) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!hasRole(access, "venue_representative", "platform_admin")) return NextResponse.json({ error: "Venue representative access required." }, { status: 403 });
  await connectMongo();
  const filter = hasRole(access, "platform_admin") ? { "venueConfirmation.state": "requested" } : { eventId: { $in: [...access.assignedEventIds] }, "venueConfirmation.state": "requested" };
  const events = await Event.find(filter).sort({ "venueConfirmation.requestedAt": 1 }).lean();
  return NextResponse.json({ confirmations: events.map((event) => ({ eventId: event.eventId, title: event.title, venue: event.venue, exactVenueAddress: event.exactVenueAddress, dateISO: event.dateISO, capacity: event.capacity, requestedAt: event.venueConfirmation.requestedAt })) });
}

export async function PATCH(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 20);
  if (limited) return limited;
  const access = await getAccessContext();
  if (!access) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!hasRole(access, "venue_representative", "platform_admin")) return NextResponse.json({ error: "Venue representative access required." }, { status: 403 });
  const body = await request.json();
  const eventId = Number(body.eventId);
  if (!Number.isSafeInteger(eventId) || !new Set(["approve", "dispute"]).has(body.decision)) return NextResponse.json({ error: "Choose an event and decision." }, { status: 400 });
  if (!hasRole(access, "platform_admin") && !access.assignedEventIds.has(eventId)) return NextResponse.json({ error: "You are not assigned to this venue confirmation." }, { status: 403 });
  await connectMongo();
  const event = await Event.findOne({ eventId, "venueConfirmation.state": "requested" });
  if (!event) return NextResponse.json({ error: "Confirmation request not found." }, { status: 404 });
  const approved = body.decision === "approve";
  event.venueConfirmation = { ...event.venueConfirmation, state: approved ? "approved" : "disputed", respondedAt: new Date(), responseMode: "venue_portal", responseNote: String(body.note || "").trim().slice(0, 1000) };
  event.status = approved ? "Verification Pending" : "Changes Required";
  await event.save();
  return NextResponse.json({ eventId, venueConfirmation: event.venueConfirmation.state, status: event.status, message: approved ? "Venue response recorded. Platform review is still required." : "Venue dispute recorded." });
}
