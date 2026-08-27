const configuredUri = process.env.MONGODB_URI?.trim();

if (process.env.NODE_ENV === "production" && !configuredUri) {
  throw new Error("MONGODB_URI is required in production.");
}

export const mongoUri = configuredUri || "mongodb://127.0.0.1:27017/scenemates";

if (process.env.NODE_ENV === "production") {
  const usesSrvTls = mongoUri.startsWith("mongodb+srv://");
  const explicitlyUsesTls = /[?&](?:tls|ssl)=true(?:&|$)/i.test(mongoUri);
  const isLoopback =
    /^mongodb:\/\/(?:[^@/\s]+@)?(?:localhost|127\.0\.0\.1|\[::1\])(?::|\/)/i.test(
      mongoUri,
    );
  if (!usesSrvTls && !explicitlyUsesTls && !isLoopback) {
    throw new Error("Production MongoDB connections must use TLS.");
  }
}
