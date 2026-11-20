import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { canAccessEventChat, getOrCreateEventRoom } from "@/lib/eventChat";
import { getSessionUser } from "@/lib/session";
import EventChatMessage from "@/models/EventChatMessage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function context(params) {
  const user = await getSessionUser();
  const { eventId: rawEventId } = await params;
  const eventId = Number(rawEventId);
  if (!user || !Number.isSafeInteger(eventId)) return { user, eventId, room: null };
  await connectMongo();
  if (!(await canAccessEventChat(eventId, user.id))) return { user, eventId, room: null };
  return { user, eventId, room: await getOrCreateEventRoom(eventId) };
}

export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, 100);
  if (limited) return limited;
  const { user, room } = await context(params);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!room) return NextResponse.json({ error: "A confirmed booking is required." }, { status: 403 });
  const cursor = new URL(request.url).searchParams.get("before");
  const filter = { roomId: room._id };
  if (cursor && mongoose.isValidObjectId(cursor)) filter._id = { $lt: cursor };
  const messages = await EventChatMessage.find(filter).sort({ _id: -1 }).limit(50).lean();
  return NextResponse.json({ room: { eventName: room.eventName, expiresAt: room.expiresAt }, messages: messages.reverse().map((message) => ({ id: message._id.toString(), senderProfileId: message.senderProfileId, text: message.body, createdAt: message.createdAt })) });
}

export async function POST(request, { params }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;
  const { user, eventId, room } = await context(params);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!room) return NextResponse.json({ error: "A confirmed booking is required." }, { status: 403 });
  if (room.expiresAt <= new Date()) return NextResponse.json({ error: "This event chat has closed." }, { status: 410 });
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 1200) return NextResponse.json({ error: "Messages must be 1–1200 characters." }, { status: 400 });
  const message = await EventChatMessage.create({ roomId: room._id, eventId, senderProfileId: String(user.id), body: text, expiresAt: room.expiresAt });
  return NextResponse.json({ message: { id: message._id.toString(), senderProfileId: message.senderProfileId, text: message.body, createdAt: message.createdAt } }, { status: 201 });
}
