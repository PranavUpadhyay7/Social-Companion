import { GridFSBucket, ObjectId } from "mongodb";
import authMongoClient from "@/lib/authMongo";

export const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

export async function mediaBucket() {
  const client = await authMongoClient.connect();
  return new GridFSBucket(client.db(), { bucketName: "profileMedia" });
}

export function validObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export function fileMatchesMime(buffer, mime) {
  if (mime === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mime === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  if (mime === "video/mp4") {
    return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  }
  if (mime === "video/webm") {
    return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  }
  return false;
}
