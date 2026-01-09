import { verifyAccessToken } from "../utils/token.js";

// admin authentication middleware
const authAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization required. Please login as admin.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    
    if (decoded.role !== "admin") {
       return res.status(403).json({
         success: false,
         message: "Admin access only",
       });
     }
  
    
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
