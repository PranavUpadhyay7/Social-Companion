import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import Event from "@/models/Event";
import GuestEntry from "@/models/GuestEntry";

export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, 80);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const passId = String((await params).passId || "").slice(0, 120);
  await connectMongo();
  const entry = await GuestEntry.findOne({ passId }).lean();
  if (!entry) return NextResponse.json({ result: "invalid", error: "Pass not found." }, { status: 404 });
  const event = await Event.findOne({ eventId: entry.eventId }).lean();
  const canView = entry.userProfileId === String(user.id) || event?.ownerProfileId === String(user.id);
  if (!canView) return NextResponse.json({ error: "You cannot view this pass." }, { status: 403 });
  const valid = ["Approved", "Confirmed"].includes(entry.status) && entry.checkInStatus !== "Checked In";
  return NextResponse.json({ pass: {
    passId: entry.passId,
    qrValue: entry.passId,
    guestName: entry.guestName,
    eventName: event?.title || "Event",
    venue: event?.venue || "",
    dateISO: event?.dateISO || "",
    plusOnes: entry.plusOnes,
    entryConditions: event?.entryConditions || "Entry remains subject to event and venue conditions.",
    arrivalDeadline: entry.arrivalDeadline,
    paymentStatus: entry.paymentStatus,
    validity: entry.status === "Cancelled" ? "cancelled" : entry.checkInStatus === "Checked In" ? "already_used" : valid ? "valid" : "invalid",
  } });
}
