const isDev = process.env.NODE_ENV !== "production";
// Local dev frontends get an auto-assigned port each run, so in dev we accept
// any localhost origin/referer instead of maintaining an exact port list here.
const isLocalhostUrl = (url) => /^https?:\/\/(localhost|127\.0\.0\.1):\d+/.test(url);

export const validateOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

  // Case 1: Origin header exists → must be allowed
  if (origin) {
    if (!allowedOrigins.includes(origin) && !(isDev && isLocalhostUrl(origin))) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid origin",
      });
    }
    return next();
  }

  // Case 2: No Origin, fallback to Referer
  if (referer) {
    const isAllowed =
      allowedOrigins.some((o) => referer.startsWith(o)) ||
      (isDev && isLocalhostUrl(referer));
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid referer",
      });
    }
    return next();
  }

  // Case 3: No Origin & No Referer (Postman, curl, mobile apps)
  // Allow in development, block in production
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  // In production, block requests without origin/referer
  return res.status(403).json({
    success: false,
    message: "Forbidden: Missing origin/referer headers",
  });
};
