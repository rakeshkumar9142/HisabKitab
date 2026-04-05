const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { JWT_SECRET } = require("../config/jwt");

/**
 * JWT secret: env in production; config module falls back for local dev only.
 * Prefer setting JWT_SECRET on the server (e.g. PM2 ecosystem / .env on EC2).
 */
function getJwtSecret() {
  return process.env.JWT_SECRET || JWT_SECRET;
}

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length < 2 || parts[0].toLowerCase() !== "bearer") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = parts[1]?.trim();
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (process.env.AUTH_DEBUG === "1") {
      console.log("TOKEN:", token);
      console.log("DECODED:", decoded);
    }

    const userId = decoded.id ?? decoded.userId ?? decoded.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(String(userId)).select("-password");

    if (process.env.AUTH_DEBUG === "1") {
      console.log("USER:", user ? { _id: user._id, phone: user.phone } : null);
    } else {
      console.log("[auth] ok userId:", String(userId), user ? "found" : "missing");
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("[auth] Token validation error:", err?.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { protect };
