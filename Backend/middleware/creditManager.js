import redis from "../config/redis.js";
import User from "../models/userModel.js";

const getSecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
};

export const checkCredit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const redisKey = `credits:${userId}`;

    // 1. Check Redis FIRST — skip DB entirely on cache hit
    let credits = await redis.get(redisKey);

    if (credits !== null){
      // Key exists → Redis is source of truth, no DB needed
      console.log("Fetching from Redis, no DB call!!")
      if (Number(credits) <= 0) {
        return res.status(403).json({ success: false, message: "Daily credit limit reached" });
      }
      return next();
    }

    // 2. Cache miss → go to DB (first request of the day or after midnight expiry)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false });

    const today = new Date().toDateString();
    const lastReset = new Date(user.credits.lastReset).toDateString();

    if (today !== lastReset) {
      user.credits.remaining = user.credits.dailyLimit;
      user.credits.lastReset = new Date();
      await user.save();
    }

    if (user.credits.remaining <= 0) {
      return res.status(403).json({ success: false, message: "Daily credit limit reached" });
    }

    console.log("Fetching from DB for credits!!")

    
    // 3. Warm Redis for all subsequent requests today
    const ttl = getSecondsUntilMidnight();
    await redis.set(redisKey, user.credits.remaining, "EX", ttl);

    next();
  } catch (err) {
    next(err);
  }
};
