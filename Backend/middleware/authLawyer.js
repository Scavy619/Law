import { verifyAccessToken } from "../utils/token.js";

// Lawyer authentication middleware
const authLawyer = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Please login as lawyer.",
    });
  }

  const token = authHeader.split(" ")[1];

  // Verify access token
  try {
    const decoded = verifyAccessToken(token);

    // decoded payload = { id, iat, exp }
    // Lawyer identity
    req.lawyer = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access token expired or invalid. Please login again.",
    });
  }
};

export default authLawyer;
