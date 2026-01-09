import { verifyAccessToken } from "../utils/token.js";

// Access-token authentication middleware
const authUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // check bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Please login.",
    });
  }

  const token = authHeader.split(" ")[1];

  // verify the access token
  try {
    const decoded = verifyAccessToken(token);

    // decoded = { id, iat, exp }
    req.user = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Access token expired or invalid. Please refresh login.",
    });
  }
};

export default authUser;
