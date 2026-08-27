import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  enforceRateLimit,
  rejectBodyOverLimit,
  rejectCrossOrigin,
} from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";

async function getConversation(conversationId, currentUserId) {
  if (!mongoose.isValidObjectId(conversationId)) return null;
  return Conversation.findOne({
    _id: conversationId,
    participantIds: currentUserId,
  });
}

export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, 100);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  await connectMongo();
  const { conversationId } = await params;
  const conversation = await getConversation(conversationId, user.id);
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();
  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message._id.toString(),
      from: message.senderProfileId === user.id ? "me" : "them",
      text: message.body,
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt?.toISOString() || null,
    })),
  });
}

export async function POST(request, { params }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { conversationId } = await params;
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 1200) {
      return NextResponse.json({ error: "Messages must be 1-1200 characters." }, { status: 400 });
    }

    await connectMongo();
    const conversation = await getConversation(conversationId, user.id);
    if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

    const message = await Message.create({
      conversationId: conversation._id,
      senderProfileId: user.id,
      body: text,
      readAt: new Date(),
    });
    conversation.lastMessageText = text;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    return NextResponse.json(
      {
        message: {
          id: message._id.toString(),
          from: "me",
          text: message.body,
          createdAt: message.createdAt.toISOString(),
          readAt: message.readAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    logServerError("Send message failed", error);
    return NextResponse.json({ error: "Message could not be sent." }, { status: 500 });
  }
}
