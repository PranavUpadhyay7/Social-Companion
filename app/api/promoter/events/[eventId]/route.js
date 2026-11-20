import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import { evaluateEventRisk } from "@/lib/riskRules";
import Event from "@/models/Event";
import PromoterProfile from "@/models/PromoterProfile";

const EVENT_STATES = new Set(["Draft", "Verification Pending", "Venue Confirmation Pending", "Changes Required", "Venue Confirmed", "Published", "Cancelled", "Completed"]);

export async function PATCH(request, { params }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 32 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const eventId = Number((await params).eventId);
  if (!Number.isSafeInteger(eventId)) return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  const body = await request.json();
  await connectMongo();
  const event = await Event.findOne({ eventId, ownerProfileId: String(user.id) });
  if (!event) return NextResponse.json({ error: "Event not found or not owned by you." }, { status: 404 });

  if (body.action === "request_venue_confirmation") {
    if (!event.exactVenueAddress || !event.venueContact) {
      return NextResponse.json({ error: "Exact venue and venue contact are required." }, { status: 400 });
    }
    event.venueConfirmation = { state: "requested", requestedAt: new Date(), respondedAt: null, responseMode: "internal_demo", responseNote: "" };
    event.status = "Venue Confirmation Pending";
  } else if (body.action === "demo_venue_response") {
    if (event.venueConfirmation?.state !== "requested") {
      return NextResponse.json({ error: "Venue confirmation has not been requested." }, { status: 409 });
    }
    const approved = body.decision === "approve";
    event.venueConfirmation = {
      ...event.venueConfirmation,
      state: approved ? "approved" : "disputed",
      respondedAt: new Date(),
      responseMode: "internal_demo",
      responseNote: String(body.note || "").trim().slice(0, 1000),
    };
    event.status = approved ? "Verification Pending" : "Changes Required";
    event.guestListSettings.enabled = false;
  } else if (body.action === "demo_platform_review") {
    if (event.venueConfirmation?.state !== "approved") {
      return NextResponse.json({ error: "An approved venue response is required before platform review." }, { status: 409 });
    }
    event.status = "Venue Confirmed";
    event.guestListSettings.enabled = true;
  } else if (body.action === "publish") {
    if (event.venueConfirmation?.state !== "approved") {
      return NextResponse.json({ error: "Venue confirmation must be approved before publishing." }, { status: 409 });
    }
    event.status = "Published";
    event.guestListSettings.enabled = true;
  } else if (body.action === "update_guest_list") {
    if (event.venueConfirmation?.state !== "approved") {
      return NextResponse.json({ error: "Guest-list actions unlock after venue approval." }, { status: 409 });
    }
    event.guestListSettings = {
      enabled: true,
      capacity: Math.max(1, Math.min(Number(body.capacity) || event.capacity, event.capacity)),
      closesAt: body.closesAt ? new Date(body.closesAt) : null,
      entryType: new Set(["Free", "Payment Required", "Invite Only"]).has(body.entryType) ? body.entryType : "Free",
      plusOneAllowance: Math.max(0, Math.min(Number(body.plusOneAllowance) || 0, 5)),
      entryInstructions: String(body.entryInstructions || "").trim().slice(0, 1000),
      referralCode: event.guestListSettings.referralCode || `${event.eventId}-${String(user.id).slice(-6)}`,
    };
  } else if (EVENT_STATES.has(body.status)) {
    if (body.status === "Venue Confirmed" && event.venueConfirmation?.state !== "approved") {
      return NextResponse.json({ error: "Venue Confirmed cannot be set without an approved venue response." }, { status: 409 });
    }
    event.status = body.status;
  } else {
    return NextResponse.json({ error: "Unsupported event action." }, { status: 400 });
  }
  await event.save();
  const promoter = await PromoterProfile.findOne({ ownerProfileId: String(user.id) }).lean();
  const flags = await evaluateEventRisk(event, promoter);
  return NextResponse.json({
    event: {
      eventId: event.eventId,
      status: event.status,
      venueConfirmation: event.venueConfirmation,
      guestListSettings: event.guestListSettings,
    },
    riskReview: flags.length ? { flagged: true, rules: flags.map((flag) => flag.rule), label: "Deterministic review rules" } : { flagged: false },
  });
}
