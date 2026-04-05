require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes.js");
const itemRoutes = require("./routes/item.routes");
const billRoutes = require("./routes/bill.routes");
const deviceRoutes = require("./routes/device.routes");
const shopRoutes = require("./routes/shop.routes");

const app = express();

// CORS: `origin: "*"` cannot be used with `credentials: true` in browsers.
// Reflecting the request origin allows credentials + any caller (typical for API + separate Nginx host).
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Middleware
app.use(express.json());
app.use(morgan("dev"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/shop", shopRoutes);

// ✅ Default route (for testing)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Central error handler — avoids silent crashes; async errors via express-async-errors
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("[server]", err?.stack || err?.message || err);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;