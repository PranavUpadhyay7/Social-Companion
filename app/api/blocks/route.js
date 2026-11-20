import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import Block from "@/models/Block";
import Conversation from "@/models/Conversation";
import Match from "@/models/Match";
import Message from "@/models/Message";

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 20);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  const targetId = String(body.profileId || "");
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(targetId) || targetId === String(user.id)) return NextResponse.json({ error: "Choose a valid profile." }, { status: 400 });
  await connectMongo();
  await Block.updateOne({ blockerProfileId: String(user.id), blockedProfileId: targetId }, { $setOnInsert: { blockerProfileId: String(user.id), blockedProfileId: targetId } }, { upsert: true });
  const matches = await Match.find({ $or: [{ userProfileId: user.id, vibedProfileId: targetId }, { userProfileId: targetId, vibedProfileId: user.id }] }).select("_id").lean();
  const matchIds = matches.map((match) => match._id);
  const conversations = matchIds.length ? await Conversation.find({ matchId: { $in: matchIds } }).select("_id").lean() : [];
  if (conversations.length) await Message.deleteMany({ conversationId: { $in: conversations.map((item) => item._id) } });
  if (matchIds.length) {
    await Conversation.deleteMany({ matchId: { $in: matchIds } });
    await Match.deleteMany({ _id: { $in: matchIds } });
  }
  return NextResponse.json({ ok: true });
}
