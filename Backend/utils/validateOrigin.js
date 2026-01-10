export const validateOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

  // Case 1: Origin header exists → must be allowed
  if (origin) {
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid origin",
      });
    }
    return next();
  }

  // Case 2: No Origin, fallback to Referer
  if (referer) {
    const isAllowed = allowedOrigins.some((o) => referer.startsWith(o));
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
