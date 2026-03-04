import redis from "../config/redis.js";

/*
  buildLimiter — shared internal factory

  Implements a fixed-window rate limiting strategy using Redis.

  Why Redis?
  - Works across multiple server instances (cluster safe)
  - Atomic increment operations (INCR)
  - Automatic key expiration for window reset
  - No memory leak risk like in-memory counters

  Parameters:
  - limit: maximum number of requests allowed within the window
  - windowSeconds: time window in seconds
  - keyFn: function(req) => string — determines the Redis key
*/
const buildLimiter = (limit, windowSeconds, keyFn) => {
  return async (req, res, next) => {
    try {
      const key = keyFn(req);

      // INCR is atomic — creates key at 1 if missing, increments if exists
      const currentCount = await redis.incr(key);

      // Set expiry only on first request to start the fixed window
      if (currentCount === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (currentCount > limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/*
  rateLimiter — GLOBAL use only (app.use)

  Key: rl:global:<ip>
  All routes from the same IP share one counter.

  Example:
  app.use(rateLimiter(200, 60))  -> 200 requests per minute per IP across all routes
*/
export const rateLimiter = (limit, windowSeconds) => {
  return buildLimiter(limit, windowSeconds, (req) => `rl:global:${req.ip}`);
};

/*
  routeLimiter — per-route use only

  Key: rl:<identifier>:<method>:<path>
  Each route gets its own isolated counter per identifier.

  Parameters:
  - limit: maximum requests allowed within the window
  - windowSeconds: time window in seconds
  - keyGenerator (optional): custom function to determine identifier
    Defaults to req.ip if not provided.

  Example usages:
  routeLimiter(5, 60)                        -> 5 attempts per minute per IP on this route
  routeLimiter(3, 3600)                      -> 3 attempts per hour per IP on this route
  routeLimiter(30, 60, req => req.user.id)   -> 30 requests per minute per user on this route
*/
export const routeLimiter = (limit, windowSeconds, keyGenerator) => {
  return buildLimiter(
    limit,
    windowSeconds,
    (req) =>
      `rl:${keyGenerator ? keyGenerator(req) : req.ip}:${req.method}:${req.originalUrl.split("?")[0]}`,
  );
};
