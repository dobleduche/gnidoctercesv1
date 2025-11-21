import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Shared Redis client for lightweight middleware features (e.g., rate limiting).
 * BullMQ creates its own dedicated connections for worker/queue operations.
 */
export const rateLimitRedis = new IORedis(redisUrl, {
  // Prevent stuck requests when Redis is unavailable.
  maxRetriesPerRequest: 1,
  enableAutoPipelining: true
});

let hasLoggedError = false;

rateLimitRedis.on('error', (err) => {
  if (!hasLoggedError) {
    console.error('Rate limiter Redis connection error:', err);
    hasLoggedError = true;
  }
});

export async function ensureRateLimitRedis() {
  if (rateLimitRedis.status === 'ready' || rateLimitRedis.status === 'connecting') {
    return rateLimitRedis;
  }

  try {
    await rateLimitRedis.connect();
    return rateLimitRedis;
  } catch (error) {
    if (!hasLoggedError) {
      console.error('Unable to connect Redis for rate limiter; allowing requests.', error);
      hasLoggedError = true;
    }
    throw error;
  }
}
