import mongoose from "mongoose";
import { mongoUri } from "@/lib/mongoConfig";

const globalCache = globalThis;

if (!globalCache.__scenematesMongo) {
  globalCache.__scenematesMongo = { connection: null, promise: null };
}

export async function connectMongo() {
  const cache = globalCache.__scenematesMongo;

  if (cache.connection) return cache.connection;
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.connection;
}
