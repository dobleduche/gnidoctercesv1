import { NextFunction, Request, Response } from 'express';
import { ensureRateLimitRedis, rateLimitRedis } from '../redisClient.js';

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);

export async function redisRateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = `rate:${req.ip}`;

  try {
    await ensureRateLimitRedis();

    const [[, count], [, ttl]] = (await rateLimitRedis
      .multi()
      .incr(key)
      .pttl(key)
      .exec()) as [[Error | null, number], [Error | null, number]];

    const windowRemaining = ttl > 0 ? ttl : WINDOW_MS;

    if (count === 1 || ttl < 0) {
      await rateLimitRedis.pexpire(key, WINDOW_MS);
    }

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - count).toString());
    res.setHeader('X-RateLimit-Reset', (Date.now() + windowRemaining).toString());

    if (count > MAX_REQUESTS) {
      res.setHeader('Retry-After', Math.ceil(windowRemaining / 1000).toString());
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    return next();
  } catch (error) {
    console.error('Rate limiter error; allowing request to continue', error);
    return next();
  }
}
