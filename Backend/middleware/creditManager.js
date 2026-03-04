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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false });

    const today = new Date().toDateString();
    const lastReset = new Date(user.credits.lastReset).toDateString();

    // if today's date is different from last reset date, it means naya din has started. So we gotta refresh credits
    if (today !== lastReset) {
      user.credits.remaining = user.credits.dailyLimit; // reset daily
      user.credits.lastReset = new Date();
      await user.save();
    }

    let credits = await redis.get(redisKey);

    // if redis does not have the credits, that means its first request of user or redis has expired at midnight, therefore we set the key
    if (!credits) {
      const ttl = getSecondsUntilMidnight();
      credits = user.credits.remaining;
      await redis.set(redisKey, credits, "EX", ttl); // auto expire at midnight
    }

    if (Number(credits) <= 0) {
      return res.status(403).json({
        success: false,
        message: "Daily credit limit reached",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};
