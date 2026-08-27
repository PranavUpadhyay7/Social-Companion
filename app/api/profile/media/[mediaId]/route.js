import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { enforceRateLimit, rejectCrossOrigin } from "@/lib/apiSecurity";
import Profile from "@/models/Profile";
import { mediaBucket, validObjectId } from "@/lib/profileMedia";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findMediaFile(mediaId) {
  const objectId = validObjectId(mediaId);
  if (!objectId) return null;
  const bucket = await mediaBucket();
  const files = await bucket.find({ _id: objectId }).limit(1).toArray();
  return files[0] ? { bucket, file: files[0], objectId } : null;
}

export async function GET(request, { params }) {
  const limited = enforceRateLimit(request, 300);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const { mediaId } = await params;
  const mediaFile = await findMediaFile(mediaId);
  if (!mediaFile) return new NextResponse(null, { status: 404 });

  await connectMongo();
  const visibleToMember = await Profile.exists({ "media.mediaId": mediaId });
  if (!visibleToMember) return new NextResponse(null, { status: 404 });

  const { bucket, file, objectId } = mediaFile;
  const range = request.headers.get("range");
  let start = 0;
  let end = file.length - 1;
  let status = 200;

  if (range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) return new NextResponse(null, { status: 416 });
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), file.length - 1) : file.length - 1;
    if (start > end || start >= file.length) return new NextResponse(null, { status: 416 });
    status = 206;
  }

  const stream = bucket.openDownloadStream(objectId, { start, end: end + 1 });
  const headers = new Headers({
    "accept-ranges": "bytes",
    "cache-control": "private, no-store",
    "content-type": file.contentType || "application/octet-stream",
    "content-length": String(end - start + 1),
    "x-content-type-options": "nosniff",
  });
  if (status === 206) headers.set("content-range", `bytes ${start}-${end}/${file.length}`);

  return new Response(Readable.toWeb(stream), { status, headers });
}

export async function DELETE(request, { params }) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const limited = enforceRateLimit(request, 20);
  if (limited) return limited;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { mediaId } = await params;
    await connectMongo();
    const profile = await Profile.findOne({
      profileId: user.id,
      "media.mediaId": mediaId,
    });
    if (!profile) return NextResponse.json({ error: "Media not found." }, { status: 404 });

    const mediaFile = await findMediaFile(mediaId);

    profile.media = profile.media.filter((item) => item.mediaId !== mediaId);
    if (
      profile.featuredMediaId === mediaId ||
      profile.image === `/api/profile/media/${mediaId}`
    ) {
      const nextFeatured = profile.media.find((item) => item.type === "image");
      profile.featuredMediaId = nextFeatured?.mediaId || "";
      profile.image = nextFeatured?.src || "";
    }
    await profile.save();
    if (mediaFile) {
      await mediaFile.bucket.delete(mediaFile.objectId).catch((error) => {
        logServerError("Detached profile media cleanup failed", error);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerError("Profile media deletion failed", error);
    return NextResponse.json({ error: "Media could not be deleted." }, { status: 500 });
  }
}
