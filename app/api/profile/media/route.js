import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import {
  enforceRateLimit,
  rejectBodyOverLimit,
  rejectCrossOrigin,
} from "@/lib/apiSecurity";
import { getAuthenticatedProfile, serializeProfile } from "@/lib/profile";
import {
  fileMatchesMime,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  mediaBucket,
  VIDEO_TYPES,
} from "@/lib/profileMedia";
import { getSessionUser } from "@/lib/session";
import { logServerError } from "@/lib/securityLog";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  const sizeError = rejectBodyOverLimit(request, MAX_VIDEO_BYTES + 1024 * 1024);
  if (sizeError) return sizeError;
  const limited = enforceRateLimit(request, 10, 10 * 60_000);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let uploadedFile = null;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const makeFeatured = formData.get("featured") === "true";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image or video to upload." }, { status: 400 });
    }

    const isImage = IMAGE_TYPES.has(file.type);
    const isVideo = VIDEO_TYPES.has(file.type);
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Use JPG, PNG, WebP, MP4 or WebM files." }, { status: 415 });
    }
    if (makeFeatured && !isImage) {
      return NextResponse.json(
        { error: "Only a photo can be used as the featured profile image." },
        { status: 400 },
      );
    }
    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size <= 0 || file.size > maxBytes) {
      return NextResponse.json(
        { error: isImage ? "Images must be 8 MB or smaller." : "Videos must be 25 MB or smaller." },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!fileMatchesMime(buffer, file.type)) {
      return NextResponse.json({ error: "The file contents do not match its file type." }, { status: 415 });
    }

    await connectMongo();
    const profile = await getAuthenticatedProfile(user);
    const media = profile.media || [];
    const photoCount = media.filter((item) => item.type === "image").length;
    const videoCount = media.filter((item) => item.type === "video").length;
    if (
      media.length >= 5 ||
      (isVideo && (videoCount >= 2 || photoCount > 3)) ||
      (isImage && videoCount > 0 && photoCount >= 3)
    ) {
      return NextResponse.json(
        { error: "Use up to 5 photos, or combine up to 3 photos with 2 videos." },
        { status: 400 },
      );
    }

    const bucket = await mediaBucket();
    const upload = bucket.openUploadStream("profile-upload", {
      contentType: file.type,
      metadata: {
        ownerProfileId: user.id,
        kind: isVideo ? "video" : "image",
      },
    });
    upload.end(buffer);
    await new Promise((resolve, reject) => {
      upload.once("finish", resolve);
      upload.once("error", reject);
    });
    uploadedFile = { bucket, id: upload.id };

    const uploadedMediaId = upload.id.toString();
    const uploadedSrc = `/api/profile/media/${upload.id}`;
    profile.media.push({
      mediaId: uploadedMediaId,
      type: isVideo ? "video" : "image",
      src: uploadedSrc,
      alt: isVideo ? "Profile video" : "Profile photo",
    });
    if (isImage && (makeFeatured || !profile.featuredMediaId)) {
      profile.featuredMediaId = uploadedMediaId;
      profile.image = uploadedSrc;
    }
    await profile.save();
    uploadedFile = null;

    return NextResponse.json({ profile: serializeProfile(profile) }, { status: 201 });
  } catch (error) {
    if (uploadedFile) {
      await uploadedFile.bucket.delete(uploadedFile.id).catch(() => null);
    }
    logServerError("Profile media upload failed", error);
    return NextResponse.json({ error: "Media could not be uploaded." }, { status: 500 });
  }
}
