import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { prisma } from "../config/database.js";
import { SERVER_BOOT_ID } from "../config/serverInstance.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Invalidate sessions from previous server runs when server/terminal was closed
    if (!decoded.bootId || decoded.bootId !== SERVER_BOOT_ID) {
      return res.status(401).json({
        success: false,
        message: "Server has restarted. Session expired. Please log in again.",
      });
    }

    // Look up user in MySQL
    let user = null;
    if (decoded.id) {
      // Could be BigInt ID or email
      try {
        const userId = typeof decoded.id === "number" || /^\d+$/.test(decoded.id)
          ? BigInt(decoded.id)
          : null;

        if (userId) {
          user = await prisma.users.findUnique({
            where: { id: userId },
          });
        }
      } catch (err) {
        // Not a BigInt ID
      }
    }

    if (!user && decoded.email) {
      user = await prisma.users.findUnique({
        where: { email: decoded.email.toLowerCase() },
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found or has been deactivated.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Attach user to req
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session token.",
      error: error.message,
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(", ")}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

export default { authenticate, requireRole };
