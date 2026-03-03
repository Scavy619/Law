import redis from "../config/redis.js";

/*
  rateLimiter middleware

  This middleware implements a fixed-window rate limiting strategy
  using Redis as a distributed counter store.

  Why Redis?
  - Works across multiple server instances (cluster safe)
  - Atomic increment operations (INCR)
  - Automatic key expiration for window reset
  - No memory leak risk like in-memory counters

  Parameters:
  - limit: maximum number of requests allowed within the window
  - windowSeconds: time window in seconds
  - keyGenerator (optional): custom function to determine identifier
    If not provided, defaults to req.ip

  Example usages:
  rateLimiter(200, 60)                        -> 200 requests per minute per IP
  rateLimiter(5, 60)                          -> 5 login attempts per minute per IP
  rateLimiter(30, 60, req => req.user.id)     -> 30 requests per minute per user
*/

export const rateLimiter = (limit, windowSeconds, keyGenerator) => {
  return async (req, res, next) => {
    try {
      /*
        Determine identifier for rate limiting.

        If a custom keyGenerator is provided, use it.
        Otherwise, use req.ip (which depends on trust proxy setting).

        This allows:
        - IP-based limiting
        - User-based limiting
        - Route-specific strategies
      */
      const identifier = keyGenerator ? keyGenerator(req) : req.ip;

      /*
        Redis key format strategy:
        rl means rate limiting here.
        rl:<identifier>:<route>

        Example:
        rl:192.168.1.10:/api/auth
        rl:64fa8123:/api/chat

        This ensures:
        - Each route has separate counter
        - Each identifier (IP or userId) is isolated
        - No interference between routes
      */
      const key = `rl:${identifier}:${req.baseUrl}`;

      /*
        INCR operation in Redis is atomic.

        If the key does not exist:
          - Redis creates it
          - Sets value to 1

        If the key exists:
          - Increments current value by 1

        This guarantees safe counting even under high concurrency.
      */
      const currentCount = await redis.incr(key);

      /*
        If this is the first request in the window,
        set expiration time for this key.

        This creates a fixed time window rate limit.

        After windowSeconds, the key automatically expires,
        and the counter resets without manual cleanup.
      */
      if (currentCount === 1){
        await redis.expire(key, windowSeconds);
      }

      /*
        If request count exceeds allowed limit,
        block the request immediately.
      */
      if (currentCount > limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later."
        });
      }

      /*
        If within limit, allow request to proceed.
      */
      next();

    } catch (error) {
      /*
        In case Redis fails or any unexpected error occurs,
        pass error to global error handler.
      */
      next(error);
    }
  };
};