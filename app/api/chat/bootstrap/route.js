import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { seedTrialData, serializeConversations } from "@/lib/chat";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const limited = enforceRateLimit(request, 80);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    await connectMongo();
    await seedTrialData(user);
    return NextResponse.json({
      conversations: await serializeConversations(user.id),
    });
  } catch (error) {
    logServerError("Chat bootstrap failed", error);
    return NextResponse.json(
      { error: "Chat is temporarily unavailable." },
      { status: 503 },
    );
  }
}
