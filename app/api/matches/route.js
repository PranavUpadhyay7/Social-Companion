import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { seedTrialData, serializeConversations } from "@/lib/chat";
import {
  enforceRateLimit,
  rejectBodyOverLimit,
  rejectCrossOrigin,
} from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import Conversation from "@/models/Conversation";
import Match from "@/models/Match";
import Message from "@/models/Message";
import Profile from "@/models/Profile";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 30);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const profileId = String(body.profileId || "");
    const eventName = String(body.eventName || "").trim().slice(0, 140);
    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(profileId) || !eventName) {
      return NextResponse.json({ error: "A valid profile and event are required." }, { status: 400 });
    }

    await connectMongo();
    await seedTrialData(user);
    if (!(await Profile.exists({ profileId, isCurrentUser: false }))) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const match = await Match.findOneAndUpdate(
      { userProfileId: user.id, vibedProfileId: profileId },
      { $setOnInsert: { userProfileId: user.id, vibedProfileId: profileId, eventName } },
      { upsert: true, returnDocument: "after" },
    );
    await Conversation.findOneAndUpdate(
      { matchId: match._id },
      {
        $setOnInsert: {
          matchId: match._id,
          participantIds: [user.id, profileId],
          eventName,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    const conversations = await serializeConversations(user.id);
    return NextResponse.json(
      { conversation: conversations.find((item) => item.profileId === profileId) },
      { status: 201 },
    );
  } catch (error) {
    logServerError("Create match failed", error);
    return NextResponse.json({ error: "Could not save this vibe." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 20);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const profileId = String(body.profileId || "");
    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(profileId)) {
      return NextResponse.json({ error: "Choose a valid profile." }, { status: 400 });
    }

    await connectMongo();
    // This also marks the one-time sample conversation as seeded so removing
    // it does not cause the demo bootstrap to recreate the connection.
    await seedTrialData(user);
    const match = await Match.findOne({
      userProfileId: user.id,
      vibedProfileId: profileId,
    });
    if (!match) {
      return NextResponse.json({ error: "This vibe no longer exists." }, { status: 404 });
    }

    const conversations = await Conversation.find({ matchId: match._id })
      .select({ _id: 1 })
      .lean();
    const conversationIds = conversations.map((conversation) => conversation._id);
    if (conversationIds.length) {
      await Message.deleteMany({ conversationId: { $in: conversationIds } });
      await Conversation.deleteMany({ _id: { $in: conversationIds } });
    }
    await Match.deleteOne({ _id: match._id, userProfileId: user.id });

    return NextResponse.json({
      ok: true,
      conversations: await serializeConversations(user.id),
    });
  } catch (error) {
    logServerError("Remove vibe failed", error);
    return NextResponse.json({ error: "Could not remove this vibe." }, { status: 500 });
  }
}
