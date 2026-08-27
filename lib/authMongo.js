import { MongoClient } from "mongodb";
import { mongoUri } from "@/lib/mongoConfig";
const globalCache = globalThis;

if (!globalCache.__scenematesAuthMongoClient) {
  globalCache.__scenematesAuthMongoClient = new MongoClient(mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  });
}

export default globalCache.__scenematesAuthMongoClient;
