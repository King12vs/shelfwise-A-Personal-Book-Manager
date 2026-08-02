// Simple in-memory fixed-window rate limiter for the auth routes.
// Note: this is per-process, so it won't hold up across multiple server
// instances — swap for Redis if this ever needs to scale horizontally.

const buckets = new Map(); // key -> { count, windowStart }

const STALE_AFTER_MS = 30 * 60 * 1000; // prune old buckets so the Map doesn't grow forever
let lastSweep = Date.now();

function sweepStaleBuckets(now) {
  if (now - lastSweep < STALE_AFTER_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > STALE_AFTER_MS) buckets.delete(key);
  }
}

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  sweepStaleBuckets(now);
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    const retryAfterMs = windowMs - (now - bucket.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
