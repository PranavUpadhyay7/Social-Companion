import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import Event from "@/models/Event";
import GuestEntry from "@/models/GuestEntry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const limited = enforceRateLimit(request, 60);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  await connectMongo();
  const events = await Event.find({ ownerProfileId: String(user.id) }).sort({ createdAt: -1 }).lean();
  const ids = events.map((event) => event.eventId);
  const metrics = await GuestEntry.aggregate([
    { $match: { eventId: { $in: ids } } },
    { $group: { _id: { eventId: "$eventId", status: "$status" }, count: { $sum: 1 } } },
  ]);
  const byEvent = {};
  for (const metric of metrics) {
    byEvent[metric._id.eventId] ||= {};
    byEvent[metric._id.eventId][metric._id.status] = metric.count;
  }
  return NextResponse.json({
    events: events.map((event) => ({
      eventId: event.eventId,
      title: event.title,
      city: event.city,
      venue: event.venue,
      dateISO: event.dateISO,
      status: event.status,
      venueConfirmation: event.venueConfirmation,
      guestListSettings: event.guestListSettings,
      metrics: byEvent[event.eventId] || {},
    })),
  });
}
