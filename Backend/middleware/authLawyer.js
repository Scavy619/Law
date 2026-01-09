import { verifyAccessToken } from "../utils/token.js";

// Admin authentication middleware (access token only no need of refresh thang here)
const authAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // cehckin bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Please login as admin.",
    });
  }

  const token = authHeader.split(" ")[1];

  // verfying access token
  try {
    const decoded = verifyAccessToken(token);

    // decoded payload = { id, iat, exp }
    // Admin identity
    req.admin = {
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

export default authAdmin;
