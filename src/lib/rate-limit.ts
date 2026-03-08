/**
 * Simple in-memory Token Bucket Rate Limiter
 * Note: In a serverless/edge environment (Vercel), this memory is ephemeral and per-isolate.
 * For production with multiple instances, use Redis (upstash/ratelimit).
 * This is a basic safeguard for single-instance or valid for strictly local dev/low traffic.
 */

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

// Configuration: 10000 requests per minute per IP (Increased for E2E testing)
const CAPACITY = 10000;
const REFILL_RATE_PER_SECOND = 10000 / 60;

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const bucket = buckets.get(ip) || { tokens: CAPACITY, lastRefill: now };

    // Calculate refill
    const timePassed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timePassed * REFILL_RATE_PER_SECOND;

    bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        buckets.set(ip, bucket);
        return true; // Allowed
    }

    return false; // Rate limited
}
