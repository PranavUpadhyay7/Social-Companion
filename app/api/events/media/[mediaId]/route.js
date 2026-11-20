import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/apiSecurity";
import { eventMediaBucket, eventMediaObjectId } from "@/lib/eventMedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, 300);
  if (limited) return limited;

  const { mediaId } = await params;
  const objectId = eventMediaObjectId(mediaId);
  if (!objectId) return new NextResponse(null, { status: 404 });

  const bucket = await eventMediaBucket();
  const files = await bucket.find({ _id: objectId, "metadata.kind": "event-cover" }).limit(1).toArray();
  const file = files[0];
  if (!file) return new NextResponse(null, { status: 404 });

  const stream = bucket.openDownloadStream(objectId);
  return new Response(Readable.toWeb(stream), {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": file.contentType || "application/octet-stream",
      "content-length": String(file.length),
      "x-content-type-options": "nosniff",
    },
  });
}
