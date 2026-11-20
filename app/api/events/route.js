import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  enforceRateLimit,
  rejectBodyOverLimit,
  rejectCrossOrigin,
} from "@/lib/apiSecurity";
import { eventMediaBucket } from "@/lib/eventMedia";
import { fileMatchesMime, IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/profileMedia";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";
import Event from "@/models/Event";
import PromoterProfile from "@/models/PromoterProfile";
import GuestEntry from "@/models/GuestEntry";
import { evaluateEventRisk } from "@/lib/riskRules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CITIES = new Set([
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Goa",
  "Pune",
  "Hyderabad",
  "Kolkata",
  "Chennai",
]);
const CATEGORIES = new Set(["NIGHTLIFE", "MUSIC", "FOOD", "COMEDY", "TECH"]);
const MINIMUM_AGES = new Set([0, 18, 21, 25]);
const DRESS_CODES = new Set([
  "No dress code",
  "Casual",
  "Smart casual",
  "Partywear",
  "Formal",
  "Traditional / festive",
  "Venue-specific",
]);

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeInstagram(value) {
  const input = clean(value, 160);
  if (!input) return "";

  let handle = input.replace(/^@/, "");
  if (/^https?:\/\//i.test(handle)) {
    try {
      const url = new URL(handle);
      if (!["instagram.com", "www.instagram.com"].includes(url.hostname.toLowerCase())) return null;
      handle = url.pathname.split("/").filter(Boolean)[0] || "";
    } catch {
      return null;
    }
  } else {
    handle = handle.replace(/^(?:www\.)?instagram\.com\//i, "").split("/")[0];
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) return null;
  return `https://www.instagram.com/${handle}/`;
}

function displayDate(dateISO) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(`${dateISO}T12:00:00Z`))
    .toUpperCase();
}

function serializeEvent(event, promoter = null, promoterStats = {}) {
  const price = Number(event.priceAmount);
  return {
    id: event.eventId,
    title: event.title,
    shortTitle: event.shortTitle,
    category: event.category,
    city: event.city,
    date: displayDate(event.dateISO),
    dateISO: event.dateISO,
    fullDate: new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${event.dateISO}T12:00:00Z`)),
    venue: event.venue,
    time: event.time,
    price: price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`,
    distance: event.distance || 0,
    image: event.image,
    uploaded: true,
    venueConfirmed: event.venueConfirmation?.state === "approved",
    guestListEnabled: Boolean(event.guestListSettings?.enabled),
    guestListClosesAt: event.guestListSettings?.closesAt || null,
    artistInstagram: event.artistInstagram || "",
    minimumAge: Number(event.minimumAge) || 0,
    dressCode: event.dressCode || "No dress code",
    entryConditions: event.entryConditions || "",
    promoter: promoter ? {
      displayName: promoter.displayName,
      instagram: promoter.instagram || "",
      completedEventCount: promoterStats.completedEventCount || 0,
      totalAttendees: promoterStats.totalAttendees || 0,
    } : null,
  };
}

export async function GET(request) {
  const limited = enforceRateLimit(request, 100);
  if (limited) return limited;

  try {
    await connectMongo();
    const uploadedEvents = await Event.find({ status: { $in: ["Published", "published"] } })
      .sort({ dateISO: 1, createdAt: -1 })
      .limit(100)
      .lean();
    const promoterIds = [...new Set(uploadedEvents.map((event) => event.ownerProfileId))];
    const promoters = await PromoterProfile.find({ ownerProfileId: { $in: promoterIds } }).lean();
    const promoterMap = new Map(promoters.map((profile) => [profile.ownerProfileId, profile]));
    const completedEvents = await Event.find({ ownerProfileId: { $in: promoterIds }, status: "Completed" }).select("eventId ownerProfileId").lean();
    const eventOwnerMap = new Map(completedEvents.map((event) => [event.eventId, event.ownerProfileId]));
    const attendeeCounts = completedEvents.length ? await GuestEntry.aggregate([
      { $match: { eventId: { $in: completedEvents.map((event) => event.eventId) }, checkInStatus: "Checked In" } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]) : [];
    const promoterStats = new Map(promoterIds.map((id) => [id, { completedEventCount: 0, totalAttendees: 0 }]));
    completedEvents.forEach((event) => { promoterStats.get(event.ownerProfileId).completedEventCount += 1; });
    attendeeCounts.forEach((item) => { const owner = eventOwnerMap.get(item._id); if (owner) promoterStats.get(owner).totalAttendees += item.count; });
    return NextResponse.json({ events: uploadedEvents.map((event) => serializeEvent(event, promoterMap.get(event.ownerProfileId), promoterStats.get(event.ownerProfileId))) });
  } catch (error) {
    logServerError("Uploaded events load failed", error);
    return NextResponse.json({ error: "Uploaded events could not be loaded." }, { status: 500 });
  }
}

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, MAX_IMAGE_BYTES + 256 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 6, 60 * 60_000);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Login or register to list an event." }, { status: 401 });
  }

  let uploadedFile = null;
  try {
    const form = await request.formData();
    const title = clean(form.get("title"), 140);
    const shortTitle = clean(form.get("shortTitle"), 45);
    const category = clean(form.get("category"), 20).toUpperCase();
    const city = clean(form.get("city"), 80);
    const venue = clean(form.get("venue"), 140);
    const description = clean(form.get("description"), 3000);
    const exactVenueAddress = clean(form.get("exactVenueAddress"), 300);
    const venueContact = clean(form.get("venueContact"), 120);
    const artistDetails = clean(form.get("artistDetails"), 1500);
    const artistInstagram = normalizeInstagram(form.get("artistInstagram"));
    const minimumAge = Number(form.get("minimumAge"));
    const dressCode = clean(form.get("dressCode"), 40);
    const capacity = Number(form.get("capacity"));
    const tableInformation = clean(form.get("tableInformation"), 1200);
    const entryConditions = clean(form.get("entryConditions"), 1200);
    const refundPolicy = clean(form.get("refundPolicy"), 1600);
    const dateISO = clean(form.get("dateISO"), 10);
    const time = clean(form.get("time"), 80);
    const priceAmount = Number(form.get("priceAmount"));
    const cover = form.get("cover");

    if (!title || !shortTitle || !description || !venue || !exactVenueAddress || !venueContact || !time || !entryConditions || !refundPolicy) {
      return NextResponse.json({ error: "Complete all event details." }, { status: 400 });
    }
    if (!CITIES.has(city) || !CATEGORIES.has(category)) {
      return NextResponse.json({ error: "Choose a supported city and category." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || Number.isNaN(Date.parse(`${dateISO}T00:00:00Z`))) {
      return NextResponse.json({ error: "Choose a valid event date." }, { status: 400 });
    }
    if (!Number.isFinite(priceAmount) || priceAmount < 0 || priceAmount > 1_000_000) {
      return NextResponse.json({ error: "Enter a valid ticket price in rupees." }, { status: 400 });
    }
    if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 1_000_000) {
      return NextResponse.json({ error: "Enter a valid event capacity." }, { status: 400 });
    }
    if (artistInstagram === null) {
      return NextResponse.json({ error: "Enter a valid artist Instagram handle or profile URL." }, { status: 400 });
    }
    if (!MINIMUM_AGES.has(minimumAge) || !DRESS_CODES.has(dressCode)) {
      return NextResponse.json({ error: "Choose a valid minimum age and dress code." }, { status: 400 });
    }
    if (!(cover instanceof File) || !IMAGE_TYPES.has(cover.type)) {
      return NextResponse.json({ error: "Upload a JPG, PNG or WebP cover image." }, { status: 415 });
    }
    if (cover.size <= 0 || cover.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Cover images must be 8 MB or smaller." }, { status: 413 });
    }

    const buffer = Buffer.from(await cover.arrayBuffer());
    if (!fileMatchesMime(buffer, cover.type)) {
      return NextResponse.json({ error: "The cover contents do not match its file type." }, { status: 415 });
    }

    await connectMongo();
    const promoter = await PromoterProfile.findOne({ ownerProfileId: String(user.id) });
    if (!promoter) {
      return NextResponse.json({ error: "Complete your promoter profile before submitting an event.", next: "/promoter" }, { status: 403 });
    }
    if (!promoter.instagram) {
      return NextResponse.json({ error: "Connect Instagram in your promoter profile before listing an event.", next: "/promoter" }, { status: 403 });
    }

    const bucket = await eventMediaBucket();
    const upload = bucket.openUploadStream("event-cover", {
      contentType: cover.type,
      metadata: { ownerProfileId: String(user.id), kind: "event-cover" },
    });
    upload.end(buffer);
    await new Promise((resolve, reject) => {
      upload.once("finish", resolve);
      upload.once("error", reject);
    });
    uploadedFile = { bucket, id: upload.id };

    const eventId = Date.now();
    const event = await Event.create({
      eventId,
      ownerProfileId: String(user.id),
      title,
      shortTitle,
      category,
      city,
      venue,
      description,
      exactVenueAddress,
      venueContact,
      artistDetails,
      artistInstagram,
      minimumAge,
      dressCode,
      capacity,
      tableInformation,
      entryConditions,
      refundPolicy,
      dateISO,
      time,
      priceAmount,
      image: `/api/events/media/${upload.id}`,
      imageMediaId: upload.id.toString(),
      status: "Verification Pending",
      guestListSettings: { enabled: false, capacity },
    });
    await evaluateEventRisk(event, promoter);
    uploadedFile = null;

    return NextResponse.json({
      event: { ...serializeEvent(event), status: event.status },
      message: "Event submitted for verification. It will appear publicly only after venue confirmation and platform review.",
    }, { status: 201 });
  } catch (error) {
    if (uploadedFile) {
      await uploadedFile.bucket.delete(uploadedFile.id).catch(() => null);
    }
    logServerError("Event creation failed", error);
    return NextResponse.json({ error: "The event could not be published." }, { status: 500 });
  }
}
