import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import Group from "@/models/Group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function serialize(group, userId = "") {
  return {
    id: group._id.toString(),
    name: group.name,
    event: group.eventName,
    date: "UPCOMING",
    venue: "Shared after joining",
    city: group.city,
    cover: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=85",
    members: group.memberProfileIds.length,
    capacity: group.capacity,
    initials: [],
    vibe: group.vibe,
    tags: [group.vibe, "Community group"],
    description: group.description,
    host: "SceneMates member",
    joined: group.memberProfileIds.includes(userId),
    persisted: true,
  };
}

export async function GET(request) {
  const limited = enforceRateLimit(request, 100);
  if (limited) return limited;
  const user = await getSessionUser();
  await connectMongo();
  const groups = await Group.find({ state: "active" }).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ groups: groups.map((group) => serialize(group, String(user?.id || ""))) });
}

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 16 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 5, 60 * 60_000);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login to create a group." }, { status: 401 });
  const body = await request.json();
  const name = clean(body.name, 80);
  const eventName = clean(body.event, 140);
  const city = clean(body.city || "Mumbai", 80);
  const vibe = clean(body.vibe, 50);
  const description = clean(body.description, 800);
  const capacity = Number(body.capacity);
  if (!name || !eventName || !city || !vibe || !Number.isInteger(capacity) || capacity < 2 || capacity > 500) {
    return NextResponse.json({ error: "Complete the group name, event, city, vibe and capacity." }, { status: 400 });
  }
  await connectMongo();
  const group = await Group.create({ ownerProfileId: String(user.id), name, eventName, city, vibe, description, capacity, memberProfileIds: [String(user.id)] });
  return NextResponse.json({ group: serialize(group, String(user.id)) }, { status: 201 });
}

export async function PATCH(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login to join a group." }, { status: 401 });
  const body = await request.json();
  if (!mongoose.isValidObjectId(body.groupId) || !["join", "leave"].includes(body.action)) {
    return NextResponse.json({ error: "Choose a valid group action." }, { status: 400 });
  }
  await connectMongo();
  const group = await Group.findOne({ _id: body.groupId, state: "active" });
  if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
  const userId = String(user.id);
  if (body.action === "join") {
    if (!group.memberProfileIds.includes(userId) && group.memberProfileIds.length >= group.capacity) {
      return NextResponse.json({ error: "This group is full." }, { status: 409 });
    }
    if (!group.memberProfileIds.includes(userId)) group.memberProfileIds.push(userId);
  } else {
    if (group.ownerProfileId === userId) return NextResponse.json({ error: "Transfer ownership or close the group before leaving." }, { status: 409 });
    group.memberProfileIds = group.memberProfileIds.filter((id) => id !== userId);
  }
  await group.save();
  return NextResponse.json({ group: serialize(group, userId) });
}
