import { GridFSBucket, ObjectId } from "mongodb";
import authMongoClient from "@/lib/authMongo";

export async function eventMediaBucket() {
  const client = await authMongoClient.connect();
  return new GridFSBucket(client.db(), { bucketName: "eventMedia" });
}

export function eventMediaObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}
