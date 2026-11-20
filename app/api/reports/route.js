import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectBodyOverLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import { getSessionUser } from "@/lib/session";
import TrustReport from "@/models/TrustReport";

const REASONS = new Set(["Promoter concern", "Event concern", "Misleading information", "Payment concern", "Venue mismatch", "Cancellation issue"]);

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, 8 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 5, 60 * 60_000);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login to submit a report." }, { status: 401 });
  const body = await request.json();
  const targetType = body.targetType === "promoter" ? "promoter" : "event";
  const targetId = String(body.targetId || "").trim().slice(0, 120);
  const reason = body.reason;
  const details = String(body.details || "").trim().slice(0, 1200);
  if (!targetId || !REASONS.has(reason) || details.length < 10) return NextResponse.json({ error: "Choose a reason and provide at least 10 characters of detail." }, { status: 400 });
  await connectMongo();
  const report = await TrustReport.create({ reporterProfileId: String(user.id), targetType, targetId, reason, details });
  return NextResponse.json({ reportId: report._id.toString(), status: report.status, message: "Report received. The trust team can now review it." }, { status: 201 });
}
