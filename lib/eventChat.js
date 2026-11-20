import Event from "@/models/Event";
import EventChatRoom from "@/models/EventChatRoom";
import GuestEntry from "@/models/GuestEntry";
import { eventChatExpiry } from "@/lib/domainRules.mjs";

export async function canAccessEventChat(eventId, profileId) {
  return GuestEntry.exists({
    eventId,
    userProfileId: String(profileId),
    $or: [
      { paymentStatus: "Paid" },
      { status: { $in: ["Confirmed", "Checked In"] } },
    ],
  });
}

export async function getOrCreateEventRoom(eventId) {
  const event = await Event.findOne({ eventId, status: { $nin: ["Cancelled", "Suspended"] } }).lean();
  if (!event) return null;
  const lifecycle = eventChatExpiry(event.dateISO);
  if (!lifecycle) return null;
  const { closesAt, expiresAt } = lifecycle;
  return EventChatRoom.findOneAndUpdate(
    { eventId },
    { $setOnInsert: { eventId, eventName: event.title, closesAt, expiresAt } },
    { upsert: true, returnDocument: "after" },
  );
}
