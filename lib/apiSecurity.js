const requestBuckets = new Map();
const MAX_BUCKETS = 10_000;

function pruneBuckets(now, windowMs) {
  if (requestBuckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of requestBuckets) {
    if (now - bucket.startedAt > windowMs) requestBuckets.delete(key);
  }
  if (requestBuckets.size >= MAX_BUCKETS) {
    requestBuckets.delete(requestBuckets.keys().next().value);
  }
}

function requestIdentity(request) {
  // Forwarded headers are trusted only when deployment configuration explicitly
  // says the application is behind a proxy that overwrites them.
  if (process.env.TRUST_PROXY_HEADERS === "true") {
    return (
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "proxy-unknown"
    );
  }
  return "direct";
}

export function enforceRateLimit(request, limit = 40, windowMs = 60_000) {
  const now = Date.now();
  pruneBuckets(now, windowMs);
  const url = new URL(request.url);
  const key = `${requestIdentity(request)}:${request.method}:${url.pathname}`;
  const bucket = requestBuckets.get(key);

  if (!bucket || now - bucket.startedAt > windowMs) {
    requestBuckets.set(key, { count: 1, startedAt: now });
    return null;
  }
  bucket.count += 1;
  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
  return new Response(JSON.stringify({ error: "Too many requests. Try again shortly." }), {
    status: 429,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json",
      "retry-after": String(retryAfter),
    },
  });
}

export function rejectCrossOrigin(request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !new Set(["same-origin", "same-site", "none"]).has(fetchSite)) {
    return Response.json(
      { error: "Cross-origin request rejected." },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }

  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    if (new URL(origin).origin === new URL(request.url).origin) return null;
  } catch {
    // Treat malformed origins as untrusted.
  }
  return Response.json(
    { error: "Cross-origin request rejected." },
    { status: 403, headers: { "cache-control": "no-store" } },
  );
}

export function rejectBodyOverLimit(request, maxBytes = 32 * 1024) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return null;
  const bytes = Number(contentLength);
  if (Number.isSafeInteger(bytes) && bytes >= 0 && bytes <= maxBytes) return null;
  return Response.json(
    { error: "Request body is too large." },
    { status: 413, headers: { "cache-control": "no-store" } },
  );
}
