import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import EventChatRoom from "@/models/EventChatRoom";
import GuestEntry from "@/models/GuestEntry";
import { getOrCreateEventRoom } from "@/lib/eventChat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const limited = enforceRateLimit(request, 80);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  await connectMongo();
  const entries = await GuestEntry.find({
    userProfileId: String(user.id),
    $or: [{ paymentStatus: "Paid" }, { status: { $in: ["Confirmed", "Checked In"] } }],
  }).select("eventId").lean();
  await Promise.all([...new Set(entries.map((entry) => entry.eventId))].map(getOrCreateEventRoom));
  const rooms = await EventChatRoom.find({ eventId: { $in: entries.map((entry) => entry.eventId) }, expiresAt: { $gt: new Date() } }).sort({ closesAt: 1 }).lean();
  return NextResponse.json({ rooms: rooms.map((room) => ({ id: room._id.toString(), eventId: room.eventId, eventName: room.eventName, closesAt: room.closesAt, expiresAt: room.expiresAt })) });
}
